# UI Stories

https://www.figma.com/community/plugin/1367131076759979208/ui-stories-assets-showcase-generator

UI Stories Plugin is a showcase generator that streamlines the design process by organizing and documenting assets.

# How It Works:
* Flexible Selection: Begin by selecting any component, component set, component instance, or design element like frames or shapes. The plugin automatically identifies the related component sets or components linked to your selection and displays a list for you to choose which components to document.
* Comprehensive Documentation: If no specific selection is made, the plugin will catalog all component sets and components throughout your file. It may take longer if your file includes numerous components with multiple variations.

The plugin is designed to efficiently handle large datasets to prevent freezing during rendering. However, if rendering all showcases becomes overly time-consuming, consider using the component-by-component rendering option for a quicker and more manageable process.
* Theme-Specific Documentation: For files containing multiple themes, the plugin generates themed documentation frames. For 'Dark' themes, components are displayed against a black background, while other themes use a light gray background.

Default background values are customizable (e.g., _DemoPage-darkBackgroundForComponentsDemo as #251F1F for dark themes and _DemoPage-lightBackgroundForComponentsDemo as #E9E8E8 for others).

You can adjust these backgrounds, including setting them to transparent, to suit your project needs. Once you modify these color settings, the plugin will remember your preferences and apply these settings in all subsequent operations, ensuring consistency across your documentation process.
* Rendering Options: You can choose to display the component showcases directly on the active page, where a new frame will appear at the top of your layer list. Alternatively, opt for documentation on a newly created page, where the plugin will generate a timestamped page at the bottom of your page list.
* Detailed Property Display: The plugin renders a table for properties that have multiple values, ensuring detailed visual documentation. Properties with only a single value are neatly listed below the table, providing a clear and organized overview. At the end of each table, a timestamp indicates when the showcase was rendered. Additionally, if a component has a description, it will also be displayed.
* Testing your components: For components that lack variants or have errors, I display "N/A" in the cell instead of the component, allowing you to easily test for missing variants. Keep in mind that the absence of some variants is normal, as they may not always be necessary.

As a testing tool, you can also change the background color in all cells simultaneously, visually testing how all your components and their variants appear against different backgrounds. This feature enhances the ability to ensure visual consistency across your designs.

# Key Features:
* **Generate Overview in Seconds**: Automatically generate detailed views of all components and component sets within your Figma file. Whether you select specific components or document the entire file, the plugin provides a visual inventory on a single page.
* **Theme-Specific Rendering**: The plugin facilitates rendering components against different themes, making it easy to test and compare visual consistency across various backgrounds.
* **Efficiency Boost**: Save valuable design time by generating demonstrations for components directly within Figma. This feature helps you understand how your assets function, identify missing elements, and provide clear visualizations that save development time—ensuring design integrity.
* **Dynamic Updates**: Re-run the plugin at any time to refresh your documentation as your designs evolve, ensuring your component overviews always reflect the latest changes.
