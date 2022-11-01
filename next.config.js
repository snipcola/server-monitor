const withPreact = require('next-plugin-preact');
const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/
});

module.exports = withPreact(withMDX({
    pageExtensions: ['js', 'jsx', 'md', 'mdx']
}));