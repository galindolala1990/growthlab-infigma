let loadedFigtreeSemibold: "Semibold" | "Medium" = "Semibold";
export async function loadFonts() {
  // Always load Inter Regular (default for new text nodes)
  await figma.loadFontAsync({ family: "Inter", style: "Regular" }).catch(()=>{});
  // Always load Figtree Regular
  await figma.loadFontAsync({ family: "Figtree", style: "Regular" }).catch(()=>{});
  // Try to load Semibold, fallback to Medium if not available
  try {
    await figma.loadFontAsync({ family: "Figtree", style: "Semibold" });
    loadedFigtreeSemibold = "Semibold";
  } catch {
    await figma.loadFontAsync({ family: "Figtree", style: "Medium" }).catch(()=>{});
    loadedFigtreeSemibold = "Medium";
  }
  // Always load Figtree Bold
  await figma.loadFontAsync({ family: "Figtree", style: "Bold" }).catch(()=>{});
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" }).catch(()=>{});
  await figma.loadFontAsync({ family: "Roboto", style: "Bold" }).catch(()=>{});
}
export function getLoadedFigtreeSemibold(): "Semibold" | "Medium" {
  return loadedFigtreeSemibold;
}