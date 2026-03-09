/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#0F0F0F",
                accent: {
                    red: "#B71C1C",
                    blue: "#1A237E"
                },
                surface: "rgba(30, 30, 30, 0.8)",
            },
            fontFamily: {
                title: ['Montserrat', 'sans-serif'],
                body: ['Lato', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
