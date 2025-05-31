#!/usr/bin/env python3
"""
SVG to PNG Converter Script

This script converts all SVG files in the 'extracted-icons' directory to PNG format
with a fixed size of 1024x1024 pixels while maintaining the original folder structure.
"""

import os
import sys
from pathlib import Path
from PIL import Image
import cairosvg
from io import BytesIO

def convert_svg_to_png(svg_path, png_path, size=(1024, 1024)):
    """
    Convert an SVG file to PNG format with specified size.
    
    Args:
        svg_path (str): Path to the input SVG file
        png_path (str): Path to the output PNG file
        size (tuple): Target size (width, height) in pixels
    """
    try:
        # Convert SVG to PNG using cairosvg
        png_data = cairosvg.svg2png(url=svg_path, output_width=size[0], output_height=size[1])
        
        # Save the PNG data to file
        with open(png_path, 'wb') as f:
            f.write(png_data)
        
        print(f"✓ Converted: {svg_path} -> {png_path}")
        return True
        
    except Exception as e:
        print(f"✗ Error converting {svg_path}: {str(e)}")
        return False

def create_directory_structure(source_dir, target_dir):
    """
    Create the same directory structure in target as source.
    
    Args:
        source_dir (Path): Source directory path
        target_dir (Path): Target directory path
    """
    for root, dirs, files in os.walk(source_dir):
        # Calculate relative path from source
        rel_path = Path(root).relative_to(source_dir)
        
        # Create corresponding directory in target
        target_path = target_dir / rel_path
        target_path.mkdir(parents=True, exist_ok=True)

def convert_all_svgs(source_dir="extracted-icons", target_dir="extracted-icons-png", size=(1024, 1024)):
    """
    Convert all SVG files in source directory to PNG files in target directory.
    
    Args:
        source_dir (str): Source directory containing SVG files
        target_dir (str): Target directory for PNG files
        size (tuple): Target size (width, height) in pixels
    """
    source_path = Path(source_dir)
    target_path = Path(target_dir)
    
    if not source_path.exists():
        print(f"Error: Source directory '{source_dir}' does not exist!")
        return False
    
    # Create target directory structure
    print(f"Creating directory structure in '{target_dir}'...")
    create_directory_structure(source_path, target_path)
    
    # Find all SVG files
    svg_files = list(source_path.rglob("*.svg"))
    
    if not svg_files:
        print(f"No SVG files found in '{source_dir}'")
        return False
    
    print(f"Found {len(svg_files)} SVG files to convert...")
    
    successful_conversions = 0
    failed_conversions = 0
    
    # Convert each SVG file
    for svg_file in svg_files:
        # Calculate relative path and create target PNG path
        rel_path = svg_file.relative_to(source_path)
        png_file = target_path / rel_path.with_suffix('.png')
        
        # Ensure target directory exists
        png_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Convert SVG to PNG (this will overwrite existing files)
        if convert_svg_to_png(str(svg_file), str(png_file), size):
            successful_conversions += 1
        else:
            failed_conversions += 1
    
    # Print summary
    print(f"\n🎉 Conversion complete!")
    print(f"✓ Successfully converted: {successful_conversions} files")
    if failed_conversions > 0:
        print(f"✗ Failed conversions: {failed_conversions} files")
    
    print(f"\nPNG files saved in: {target_path.absolute()}")
    return True

def install_dependencies():
    """
    Install required dependencies if not present.
    """
    try:
        import cairosvg
        from PIL import Image
        print("✓ All dependencies are installed.")
        return True
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("\nTo install required dependencies, run:")
        print("pip install cairosvg Pillow")
        return False

def main():
    """Main function to run the converter."""
    print("SVG to PNG Converter")
    print("=" * 30)
    
    # Check dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Set default parameters
    source_dir = "extracted-icons"
    target_dir = "extracted-icons-png"
    size = (1024, 1024)
    
    # Allow command line arguments
    if len(sys.argv) > 1:
        source_dir = sys.argv[1]
    if len(sys.argv) > 2:
        target_dir = sys.argv[2]
    if len(sys.argv) > 3:
        try:
            size_arg = int(sys.argv[3])
            size = (size_arg, size_arg)
        except ValueError:
            print(f"Invalid size argument: {sys.argv[3]}. Using default 1024x1024.")
    
    print(f"Source directory: {source_dir}")
    print(f"Target directory: {target_dir}")
    print(f"Target size: {size[0]}x{size[1]} pixels")
    print()
    
    # Run conversion
    success = convert_all_svgs(source_dir, target_dir, size)
    
    if success:
        print("\n🚀 All done! Your PNG icons are ready to use.")
    else:
        print("\n❌ Conversion failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main() 