/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "@/app/**/*.{js,ts,jsx,tsx,html}", // フロントエンドの構成に合わせて調整
        "@/components/**/*.{js,ts,jsx,tsx,html}", // コンポーネントのパスを調整
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}

