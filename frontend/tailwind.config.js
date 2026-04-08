/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563EB', // Blue 600
                    dark: '#1E40AF',    // Blue 800
                    light: '#60A5FA',   // Blue 400
                },
                secondary: '#475569', // Slate 600
                background: '#F8FAFC', // Slate 50
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
