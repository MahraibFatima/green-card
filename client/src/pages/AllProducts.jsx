import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { categories } from "../assets/assets";

const AllProducts = () => {
    const { products, searchQuery } = useAppContext();
    const [filteredProducts, setFilteredProducts] = React.useState([]);
    const [selectedCategory, setSelectedCategory] = React.useState("all");

    useEffect(() => {
        let nextProducts = products;

        if (searchQuery.length > 0) {
            nextProducts = nextProducts.filter((product) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== "all") {
            nextProducts = nextProducts.filter(
                (product) =>
                    product.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        setFilteredProducts(nextProducts);
    }, [products, searchQuery, selectedCategory]);

    return (
        <div className="mt-16 flex flex-col">
            <div className="flex flex-col items-end w-max">
                <p className="text-2xl font-medium uppercase">All Products</p>
                <div className="w-16 h-0.5 bg-primary rounded-full"></div>
            </div>

            <div className="mt-6 w-full flex justify-end">
                <label className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-gray-700">Filter by category</span>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 bg-white"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((item) => (
                            <option key={item.path} value={item.path}>
                                {item.text}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="products">
                {filteredProducts
                    .filter((product) => product.inStock)
                    .map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))}
            </div>
        </div>
    );
};

export default AllProducts;