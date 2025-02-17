/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          10: '#FFF5F6',
          20: '#FF8BC 20%',
          30: '#FF8DC9',
          40: '#FF849A',
          50: '#FF5C79',
          60: '#FF385C',
          70: '#D42F4D',
          80: '#B01C2E',
          90: '#67101F',
          100: '#4E0936',
        },
        neutral: {
          10: '#FFFFFF',
          20: '#F7F7F7',
          30: '#E4E9EC',
          40: '#DBDCE0',
          50: '#BABEC1',
          60: '#98989D',
          70: '#717375',
          80: '#555F61',
          90: '#323F40',
          100: '#0A0A0A',
        }
      },
      fontFamily: {
        'Cereal-Black': ['Cereal-Black', 'sans-serif'],
        'Cereal-Bold': ['Cereal-Bold', 'sans-serif'],
        'Cereal-Book': ['Cereal-Book', 'sans-serif'],
        'Cereal-Extrabold': ['Cereal-Extrabold', 'sans-serif'],
        'Cereal-Light': ['Cereal-Light', 'sans-serif'],
        'Cereal-Medium': ['Cereal-Medium', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
