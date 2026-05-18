import React from 'react';

const PagePlaceholder = ({ title }) => {
    return (
        <div className="pt-24 min-h-screen container mx-auto px-4">
            <h1 className="text-4xl text-center mb-8">{title}</h1>
            <p className="text-center text-gray-400">Content coming soon...</p>
        </div>
    );
};

export default PagePlaceholder;
