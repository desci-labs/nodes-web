import React from "react";

type Props = {
    title: string;
    subtitle: string;
    message: string;
    loading: boolean;
    LoadIcon: React.FC<any>;
    image: string;
}

const ImageCard = ({ title, subtitle, message, loading, LoadIcon, image }: Props) => {
    return <div className="max-w-xl mx-auto bg-white dark:bg-indigo-900 rounded-xl shadow-md overflow-hidden md:max-w-4xl m-20 mt-10">
        <div className="md:flex">
            <div className="md:flex-shrink-0">
                <img className="h-48 w-full object-cover md:h-full md:w-96" src={image} alt="" />
            </div>
            <div className="p-12">
                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{title}</div>
                <a href="/" className="block mt-1 text-lg leading-tight font-medium text-black dark:text-gray-300 hover:underline">{loading ? <LoadIcon className="h-6" /> : subtitle}</a>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{message}</p>
            </div>
        </div>
    </div>
}

export default ImageCard;