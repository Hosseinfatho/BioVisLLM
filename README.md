# BioNarrator: Trend-Aware Gene Expression Visualizations

BioNarrator is an interactive tool for visualizing and analyzing gene expression data using Large Language Models (LLMs). This tool allows users to interact with biomedical images, select regions of interest, and generate narrative summaries using BioBERT and GPT models.

## Key Features

- Display of biomedical images with region of interest selection capability
- Analysis of five different topics:
  - Gene Expression Trends
  - Cell Types
  - Gene Pathways
  - Gene Network Interactions
  - Biological Significance
- Choice between BioBERT and GPT models for analysis
- Modern and responsive user interface

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bionarrator.git
cd bionarrator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

## Project Structure

```
bionarrator/
├── src/
│   ├── components/
│   │   ├── ImageDisplay.tsx
│   │   └── TopicBox.tsx
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── samples/
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

1. Open the application in your browser
2. Select a tissue sample from the dropdown menu
3. Choose your preferred model (BioBERT or GPT)
4. Click and drag on the image to select a region
5. Analysis results will be displayed in the five topic boxes

## Contributing

Contributions are always welcome! To contribute:

1. Fork the project
2. Create a new branch for your feature
3. Commit your changes
4. Create a pull request

## License

This project is licensed under the MIT License. 