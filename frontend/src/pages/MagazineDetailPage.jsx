import { useParams } from "react-router-dom";
import magazines from "../json/Magazine.json";
import { useEffect } from "react";


export default function MagazineDetailPage() {

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    const { id } = useParams();
    const magazine = magazines.find(m => String(m.id) === String(id));

    if (!magazine) {
        return <p className="text-center mt-20">Magazine not found</p>;
    }

    const content = magazine.full_content;

    return (
        <div className="max-w-6xl mx-auto pt-24 pb-20 px-4 fade-in lg:pt-[250px]">

            {!content && (
                <div className="text-center py-20">
                    <h1 className="text-3xl font-bold">{magazine.title}</h1>
                    <p className="max-w-2xl mx-auto mt-6 text-gray-600">
                        Full article coming soon.
                    </p>
                </div>
            )}

            {/* FULL CONTENT FOR ID=1 */}
            {content && (
                <>
                    {/* HERO */}
                    <div className="grid md:grid-cols-2 gap-10 mb-14 fade-in">
                        <img
                            src={content.hero_section.image.desktop}
                            className="w-full object-cover rounded"
                            alt={magazine.alt}
                        />
                        <div className="flex flex-col justify-center">
                            <p className="uppercase text-sm text-gray-500 mb-3">
                                {content.hero_section.content?.category_badge}
                            </p>
                            <h1 className="text-3xl font-bold mb-4">
                                {content.hero_section.content?.title}
                            </h1>
                            <div
                                className="text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: content.hero_section.content?.description,
                                }}
                            />
                        </div>
                    </div>

                    {/* INTRO */}
                    {content.intro_text && (
                        <div
                            className="text-lg mb-10 fade-in"
                            dangerouslySetInnerHTML={{
                                __html: content.intro_text.content,
                            }}
                        />
                    )}

                    {/* GALLERY */}
                    {content.gallery_sections?.map((sec, idx) => (
                        <div key={idx} className="grid md:grid-cols-2 gap-6 mb-14 fade-in">
                            {sec.images.map((img, i) => (
                                <img
                                    key={i}
                                    src={img.desktop}
                                    className="w-full rounded object-cover"
                                    alt={img.alt}
                                />
                            ))}
                        </div>
                    ))}

                    {/* PRODUCT SLIDER */}
                    {content.product_sliders?.map((slider, idx) => (
                        <div key={idx} className="mb-16 fade-in">
                            <h2 className="text-xl font-semibold mb-6">{slider.title}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {slider.products.map((p, i) => (
                                    <div key={i} className="fade-in">
                                        <img
                                            src={p.images.desktop}
                                            className="w-full h-60 object-contain"
                                        />
                                        <p className="mt-3 text-gray-500 text-sm">{p.brand}</p>
                                        <p className="font-semibold text-black">{p.name}</p>
                                        <p className="text-sm mt-1">{p.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* TEXT BLOCK */}
                    {content.detailed_content?.sections?.map((block, idx) => (
                        <div
                            key={idx}
                            className="text-gray-700 leading-relaxed my-10 fade-in"
                            dangerouslySetInnerHTML={{ __html: block.content }}
                        />
                    ))}

                    {/* ADDITIONAL GALLERY */}
                    {content.additional_gallery?.images && (
                        <div className="grid md:grid-cols-2 gap-6 mb-14 fade-in">
                            {content.additional_gallery.images.map((img, i) => (
                                <img
                                    key={i}
                                    src={img.desktop}
                                    className="w-full rounded object-cover"
                                    alt={img.alt}
                                />
                            ))}
                        </div>
                    )}

                    {/* MORE PRODUCTS */}
                    {content.additional_products && (
                        <div className="mb-16 fade-in">
                            <h2 className="text-xl font-semibold mb-6">
                                {content.additional_products.title}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {content.additional_products.products.map((p, i) => (
                                    <div key={i} className="fade-in">
                                        <img
                                            src={p.images.desktop}
                                            className="w-full h-60 object-contain"
                                        />
                                        <p className="mt-3 text-gray-500 text-sm">{p.brand}</p>
                                        <p className="font-semibold">{p.name}</p>
                                        <p className="text-sm mt-1">{p.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
