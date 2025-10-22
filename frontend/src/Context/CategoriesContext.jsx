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
    man: "68f86b10734810ab97bb98d1",
    woman: "68f86b1c734810ab97bb9a2f"
  };

  // Helper function with delay between requests
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Fixed fetchCat function with proper API response handling
  const fetchCat = async (rootId) => {
    // Check cache first
    if (categoryCache.current.has(rootId)) {
      return categoryCache.current.get(rootId);
    }

    try {
      const topCategories = await fetchCategoryByRoot(rootId);
      const categoryWithSubs = {};

      // Now topCategories should be an array (the content)
      if (Array.isArray(topCategories)) {
        console.log(`Processing ${topCategories.length} categories for root ${rootId}`);
        
        // Process categories in batches with delays to avoid rate limiting
        const batchSize = 2;
        const batches = [];
        
        for (let i = 0; i < topCategories.length; i += batchSize) {
          batches.push(topCategories.slice(i, i + batchSize));
        }

        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          
          const batchResults = await Promise.all(
            batch.map(async (category) => {
              const categoryName = category?.name?.locs?.en || category?.name;
              const categoryId = category?._id?.$oid || category?._id;
              
              console.log(`Processing category: ${categoryName} (${categoryId})`);
              
              if (!categoryName || !categoryId) {
                console.warn('Skipping category with missing name or ID:', category);
                return null;
              }
              
              try {
                // Add delay between subcategory requests
                await delay(500);
                
                const subCategories = await fetchCategoryByRoot(categoryId);
                console.log(`Found ${subCategories.length} subcategories for ${categoryName}`);
                
                return {
                  id: categoryId,
                  name: categoryName.toLowerCase(),
                  subs: Array.isArray(subCategories)
                    ? subCategories.map(sub => ({
                        id: sub?._id?.$oid || sub?._id,
                        name: sub?.name?.locs?.en || sub?.name || "Unnamed"
                      })).filter(sub => sub.name && sub.id) // Filter out invalid subs
                    : []
                };
              } catch (subError) {
                console.error(`Error fetching subcategories for ${categoryName}:`, subError);
                // If subcategories fail, still return the main category with ID
                return { 
                  id: categoryId,
                  name: categoryName.toLowerCase(), 
                  subs: [] 
                };
              }
            })
          );
          
          // Filter out null results and add to categoryWithSubs
          batchResults
            .filter(result => result !== null)
            .forEach(result => {
              categoryWithSubs[result.name] = {
                id: result.id,
                name: result.name,
                subs: result.subs
              };
            });

          // Add delay between batches
          if (i < batches.length - 1) {
            await delay(1000);
          }
        }
      } else {
        console.warn(`Expected array for root ${rootId}, got:`, topCategories);
      }

      console.log(`Final categories for root ${rootId}:`, categoryWithSubs);
      
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
        
        console.log("Starting to fetch initial categories...");
        const [womanData, manData] = await Promise.all([
          fetchCat(navitems.woman),
          fetchCat(navitems.man)
        ]);
        
        if (isMounted) {
          console.log("Setting woman categories:", womanData);
          console.log("Setting man categories:", manData);
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

  // Fetch new arrivals when currentGender changes
  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchNewArrivals = async () => {
      if (!currentGender) return;
      
      try {
        const genderKey = currentGender || "woman";
        console.log(`Fetching new arrivals for: ${genderKey}`);
        const newArrivalData = await fetchCat(navitems[genderKey]);
        
        if (isMounted) {
          console.log("Setting new arrivals:", newArrivalData);
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
    const categoryKey = categoryName.toLowerCase();
    return categories[categoryKey]?.id || null;
  };

  // Helper function to get subcategory ID by name
  const getSubcategoryIdByName = (gender, categoryName, subcategoryName) => {
    const categories = gender === 'woman' ? womanCategories : manCategories;
    const categoryKey = categoryName.toLowerCase();
    const category = categories[categoryKey];
    if (!category || !category.subs) return null;
    
    const subcategory = category.subs.find(sub => 
      sub.name.toLowerCase() === subcategoryName.toLowerCase()
    );
    return subcategory?.id || null;
  };

  // Helper function to get all category IDs for a gender
  const getAllCategoryIds = (gender) => {
    const categories = gender === 'woman' ? womanCategories : manCategories;
    return Object.values(categories)
      .map(cat => cat.id)
      .filter(Boolean);
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