/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html","./components/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#000000",
                border: "#314158",
                accent: "#4f39f6"
            },
        },
    },
    plugins: [],
};