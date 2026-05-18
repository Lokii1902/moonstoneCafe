import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({ title, description, keywords }) => {
    return (
        <Helmet>
            <title>{title} | Moonstone Café</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta property="og:title" content={`${title} | Moonstone Café`} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
        </Helmet>
    );
};

SEO.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    keywords: PropTypes.string
};

SEO.defaultProps = {
    keywords: 'Moonstone Café, Restaurant, Multicuisine, Chennai, Luxury Dining, Biryani, Tandoori'
};

export default SEO;
