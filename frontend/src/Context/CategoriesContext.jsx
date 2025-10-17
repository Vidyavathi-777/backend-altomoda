// context/CategoriesContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchCategoryByRoot } from "../api/categories";

const CategoriesContext = createContext();

export const CategoriesProvider = ({ children, currentGender = "woman" }) => {
  const [womanCategories, setWomanCategories] = useState({});
  const [manCategories, setManCategories] = useState({});
  const [newArrivals, setNewArrivals] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cache to store already fetched categories
  const categoryCache = React.useRef(new Map());

  const navitems = {
    man: "561d7300b49dbb9c2c551be1",
    woman: "561d7300b49dbb9c2c551c29"
  };

  // Helper function with delay between requests
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Updated fetchCat with caching and rate limiting - now stores IDs
  const fetchCat = async (rootId) => {
    // Check cache first
    if (categoryCache.current.has(rootId)) {
      return categoryCache.current.get(rootId);
    }

    try {
      const topCategories = await fetchCategoryByRoot(rootId);
      const categoryWithSubs = {};

      if (Array.isArray(topCategories?.content)) {
        // Process categories in batches with delays to avoid rate limiting
        const batchSize = 2; // Process 2 categories at a time
        const batches = [];
        
        for (let i = 0; i < topCategories.content.length; i += batchSize) {
          batches.push(topCategories.content.slice(i, i + batchSize));
        }

        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          
          const batchResults = await Promise.all(
            batch.map(async (category) => {
              const categoryName = category?.name?.locs?.en;
              const categoryId = category?._id?.$oid;
              
              if (!categoryName || !categoryId) return null;
              
              try {
                // Add delay between subcategory requests
                await delay(500); // 500ms delay between subcategory fetches
                
                const subCategories = await fetchCategoryByRoot(categoryId);
                return {
                  id: categoryId, // Store category ID
                  name: categoryName.toLowerCase(),
                  subs: Array.isArray(subCategories?.content)
                    ? subCategories.content.map(sub => ({
                        id: sub?._id?.$oid, // Store subcategory ID
                        name: sub?.name?.locs?.en || "Unnamed"
                      }))
                    : []
                };
              } catch {
                // If subcategories fail, still return the main category with ID
                return { 
                  id: categoryId,
                  name: categoryName.toLowerCase(), 
                  subs: [] 
                };
              }
            })
          );
          
          batchResults.forEach(result => {
            if (result) {
              categoryWithSubs[result.name] = {
                id: result.id,
                name: result.name,
                subs: result.subs
              };
            }
          });

          // Add delay between batches
          if (i < batches.length - 1) {
            await delay(1000); // 1 second delay between batches
          }
        }
      }

      // Cache the result
      categoryCache.current.set(rootId, categoryWithSubs);
      return categoryWithSubs;
      
    } catch (error) {
      console.error(`Error fetching category ${rootId}:`, error);
      return {};
    }
  };

  // Fetch categories once for man & woman with error handling
  useEffect(() => {
    let isMounted = true;
    
    const fetchInitialCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Add initial delay before starting requests
        await delay(1000);
        
        const [womanData, manData] = await Promise.all([
          fetchCat(navitems.woman),
          fetchCat(navitems.man)
        ]);
        
        if (isMounted) {
          setWomanCategories(womanData);
          setManCategories(manData);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching initial categories:", error);
          setError("Failed to load categories. Please refresh the page.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch new arrivals when currentGender changes with debouncing
  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchNewArrivals = async () => {
      if (!currentGender) return;
      
      try {
        const genderKey = currentGender || "woman";
        const newArrivalData = await fetchCat(navitems[genderKey]);
        
        if (isMounted) {
          setNewArrivals(newArrivalData);
        }
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      }
    };

    // Debounce the new arrivals fetch to avoid rapid requests
    timeoutId = setTimeout(fetchNewArrivals, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [currentGender]);

  // Function to manually refetch categories if needed
  const refetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Clear cache before refetching
      categoryCache.current.clear();
      
      await delay(1000);
      
      const [womanData, manData, newArrivalData] = await Promise.all([
        fetchCat(navitems.woman),
        fetchCat(navitems.man),
        fetchCat(navitems[currentGender || "woman"])
      ]);
      
      setWomanCategories(womanData);
      setManCategories(manData);
      setNewArrivals(newArrivalData);
    } catch (error) {
      console.error("Error refetching categories:", error);
      setError("Failed to refresh categories.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get category ID by name
  const getCategoryIdByName = (gender, categoryName) => {
    const categories = gender === 'woman' ? womanCategories : manCategories;
    return categories[categoryName]?.id || null;
  };

  // Helper function to get subcategory ID by name
  const getSubcategoryIdByName = (gender, categoryName, subcategoryName) => {
    const categories = gender === 'woman' ? womanCategories : manCategories;
    const category = categories[categoryName];
    if (!category || !category.subs) return null;
    
    const subcategory = category.subs.find(sub => sub.name === subcategoryName);
    return subcategory?.id || null;
  };

  // Helper function to get all category IDs for a gender
  const getAllCategoryIds = (gender) => {
    const categories = gender === 'woman' ? womanCategories : manCategories;
    return Object.values(categories).map(cat => cat.id).filter(Boolean);
  };

  const value = {
    womanCategories,
    manCategories,
    newArrivals,
    loading,
    error,
    refetchCategories,
    getCategoryIdByName,
    getSubcategoryIdByName,
    getAllCategoryIds
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
};