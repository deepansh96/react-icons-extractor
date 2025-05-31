# React Icons SVG Extractor

This project extracts all SVG icons from the `react-icons` package and saves them as individual SVG files organized by icon families.

## Overview

The `react-icons` package contains over 49,000 icons from various icon families. This extractor script parses the icon definitions and converts them to standalone SVG files that can be used in any project, not just React applications.

## Extraction Results

- **Total Icons Extracted**: 49,957
- **Icon Families**: 31 families
- **Output Format**: Individual SVG files with proper XML declarations

### Icon Families Included

| Family | Count | Description |
|--------|--------|-------------|
| ai | 831 | Ant Design Icons |
| bi | 1,634 | Bootstrap Icons |
| bs | 2,716 | Bootstrap Icons (Alternative) |
| cg | 704 | css.gg |
| ci | 288 | Circum Icons |
| di | 192 | Devicons |
| fa | 1,611 | Font Awesome 5 |
| fa6 | 2,048 | Font Awesome 6 |
| fc | 329 | Flat Color Icons |
| fi | 287 | Feather Icons |
| gi | 4,040 | Game Icons |
| go | 264 | Github Octicons |
| gr | 635 | Grommet Icons |
| hi | 460 | Heroicons |
| hi2 | 972 | Heroicons 2 |
| im | 491 | IcoMoon Free |
| io | 696 | Ionicons 4 |
| io5 | 1,332 | Ionicons 5 |
| lia | 1,544 | Line Awesome |
| lu | 1,541 | Lucide |
| md | 4,341 | Material Design Icons |
| pi | 9,072 | Phosphor Icons |
| ri | 3,020 | Remix Icon |
| rx | 318 | Radix Icons |
| si | 3,275 | Simple Icons |
| sl | 189 | Simple Line Icons |
| tb | 5,754 | Tabler Icons |
| tfi | 352 | Themify Icons |
| ti | 336 | Typicons |
| vsc | 466 | VS Code Icons |
| wi | 219 | Weather Icons |

## Directory Structure

```
extracted-icons/
├── ai/
│   ├── AiFillAccountBook.svg
│   ├── AiFillAlert.svg
│   └── ...
├── bi/
│   ├── BiAbacus.svg
│   └── ...
├── bs/
│   ├── BsActivity.svg
│   └── ...
└── ... (all other families)
```

## SVG Format

Each SVG file is properly formatted with:
- XML declaration
- Standard SVG namespace
- 24x24 viewport (scalable)
- Original viewBox from react-icons
- Proper fill attributes
- All path and shape elements preserved

### Example SVG Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32z..."/>
</svg>
```

## Usage

### In HTML
```html
<img src="extracted-icons/ai/AiFillAccountBook.svg" alt="Account Book" width="24" height="24">
```

### In CSS (as background)
```css
.icon {
  background: url('extracted-icons/ai/AiFillAccountBook.svg') no-repeat center;
  background-size: 24px 24px;
  width: 24px;
  height: 24px;
}
```

### Inline SVG
You can copy the SVG content directly into your HTML for full control over styling.

### In JavaScript/Framework Projects
```javascript
import accountBookIcon from './extracted-icons/ai/AiFillAccountBook.svg';
```

## How the Extraction Works

The extraction script (`extract-icons-improved.js`) works by:

1. **Scanning Icon Families**: Reads all directories in `node_modules/react-icons/`
2. **Parsing Index Files**: Analyzes each family's `index.js` file
3. **Extracting Icon Data**: Uses text parsing to extract the `GenIcon` data structures
4. **Converting to SVG**: Transforms the React icon data into standard SVG format
5. **Organizing Output**: Saves files in family-specific directories

### Key Features of the Extractor

- **Preserves Original Structure**: Maintains all paths, attributes, and styling
- **Handles Complex Icons**: Correctly processes multi-path icons and nested elements
- **Maintains Naming**: Uses exact React component names for easy identification
- **Error Handling**: Continues processing even if individual icons fail
- **Progress Tracking**: Provides detailed logging of extraction progress

## Running the Extractor

To run the extraction yourself:

```bash
# Install react-icons first
npm install react-icons

# Run the extraction script
node extract-icons-improved.js
```

## Benefits of Extracted SVGs

1. **Framework Agnostic**: Use in any web framework or vanilla HTML/CSS
2. **Better Performance**: No JavaScript bundle overhead
3. **Easy Customization**: Direct access to SVG attributes for styling
4. **Selective Loading**: Only load the icons you need
5. **Better Caching**: Icons can be cached separately from application code
6. **SEO Friendly**: Proper semantic markup for accessibility

## License

The extracted SVG files maintain the same licenses as their original icon families. Please refer to the react-icons documentation for specific license information for each icon family.

## Contributing

If you find any issues with the extraction process or have suggestions for improvements, please feel free to contribute to this project.

# SVG to PNG Converter

This Python script converts all SVG files in the `extracted-icons` directory to PNG format with a fixed size of 1024x1024 pixels while maintaining the original folder structure.

## Features

- 🔄 **Batch Conversion**: Converts all SVG files in the directory and subdirectories
- 📁 **Structure Preservation**: Maintains the same folder structure in the output directory
- 🎯 **Fixed Size**: Converts all images to a consistent 1024x1024 pixel size
- ✅ **Progress Tracking**: Shows conversion progress and reports any errors
- 🛠 **Configurable**: Supports custom input/output directories and sizes
- 🔄 **Overwrites Existing**: Re-running the script will overwrite existing PNG files

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   Or install manually:
   ```bash
   pip install cairosvg Pillow
   ```

## Usage

### Basic Usage

Run the script with default settings (converts `extracted-icons/` to `extracted-icons-png/` with 1024x1024 size):

```bash
python svg_to_png_converter.py
```

### Custom Usage

You can specify custom parameters:

```bash
python svg_to_png_converter.py [source_dir] [target_dir] [size]
```

**Examples:**

```bash
# Custom source and target directories
python svg_to_png_converter.py my-icons my-icons-png

# Custom size (512x512 pixels)
python svg_to_png_converter.py extracted-icons extracted-icons-png 512

# All custom parameters
python svg_to_png_converter.py my-svgs my-pngs 256
```

## How It Works

1. **Dependency Check**: Verifies that required libraries are installed
2. **Directory Structure**: Creates the same folder structure in the target directory
3. **File Discovery**: Finds all `.svg` files recursively in the source directory
4. **Conversion Process**: 
   - Converts each SVG to PNG using `cairosvg`
   - Resizes to the specified dimensions (default: 1024x1024)
   - Saves with the same filename but `.png` extension
   - **Overwrites existing files** when re-run
5. **Progress Report**: Shows conversion status and final summary

## Output

The script will create a new directory structure like this:

```
extracted-icons-png/
├── ai/
│   ├── AiTwotoneTrophy.png
│   ├── AiTwotoneUnlock.png
│   └── ...
├── bs/
│   ├── BsIcon1.png
│   └── ...
└── ...
```

## Dependencies

- **cairosvg**: For SVG to PNG conversion
- **Pillow**: For image processing support

## Error Handling

- Reports any files that failed to convert
- Continues processing even if individual files fail
- Provides detailed error messages for troubleshooting

## Requirements

- Python 3.6+
- Cairo graphics library (usually pre-installed on macOS and Linux)
- Required Python packages (see requirements.txt)

## Troubleshooting

### macOS Installation Issues

If you encounter issues installing `cairosvg` on macOS, you might need to install Cairo first:

```bash
brew install cairo
pip install cairosvg Pillow
```

### Linux Installation Issues

On Ubuntu/Debian systems:

```bash
sudo apt-get install libcairo2-dev
pip install cairosvg Pillow
```

### Windows Installation Issues

For Windows, you might need to install Cairo separately or use conda:

```bash
conda install -c conda-forge cairosvg pillow
``` 