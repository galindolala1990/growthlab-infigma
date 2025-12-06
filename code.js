figma.showUI(__html__, { width: 400, height: 600 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-experiment-skeleton') {
    figma.notify('Experiment skeleton created!');
    
    // Create a simple frame as a test
    const frame = figma.createFrame();
    frame.name = "Test Experiment";
    frame.resize(200, 100);
    frame.x = 100;
    frame.y = 100;
    figma.currentPage.appendChild(frame);
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);
  }
};