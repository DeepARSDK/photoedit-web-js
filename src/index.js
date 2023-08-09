import * as deepar from 'deepar';

// Log the version. Just in case.
console.log("Deepar version: " + deepar.version);

// Top-level await is not supported.
// So we wrap the whole code in an async function that is called immediatly.
(async function() {

  // Resize the canvas according to screen size.
  const canvas = document.getElementById('deepar-canvas');
  canvas.width = window.innerWidth > window.innerHeight ? Math.floor(window.innerHeight * 0.66) : window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Initialize DeepAR.
  const deepAR = await deepar.initialize({
    licenseKey: 'your_license_key_goes_here',
    canvas: canvas,
    rootPath: "./deepar-resources", // See webpack.config.js and package.json build script.
    additionalOptions: {
      // Disable the default webcam preview.
      cameraConfig: {
        disableDefaultCamera: true
      },
      hint: "faceModelsPredownload" // Download the face tracking model as soon as possible.
    }
  });

  deepAR.setPaused(true);

  // Hide the loading screen.
  document.getElementById("loader-wrapper").style.display = "none";

  // Nice util function for loading an image.
  async function getImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {resolve(img)};
      img.onerror = reject;
      img.src = src;
    })
  }

  // Using setTimeout with await.
  async function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t));
  }

  // Function for changing the photo.
  async function processPhoto(src) {
    let image;
    if(typeof src == "string") {
      image = await getImage(src);
    } else {
      image = src;
    }

    // Process image multiple times to get more accurate tracking results.
    // Face tracking gets better with successive frames.
    deepAR.processImage(image);
    deepAR.processImage(image);
    deepAR.processImage(image);

    return image;
  }
  
  // Load the inital photo.
  let image = await processPhoto('./test_photos/camera1.jpg');

  document.getElementById('load-photo-1').onclick = async function() {
    image = await processPhoto('./test_photos/camera1.jpg');
  }
  document.getElementById('load-photo-2').onclick = async function() {
    image = await processPhoto('./test_photos/camera2.jpg');
  }
  document.getElementById('apply-makeup-look-1').onclick = async function() {
    deepAR.switchEffect('./effects/look1');
    await delay(33);
    await processPhoto(image);
  }
  document.getElementById('apply-makeup-look-2').onclick = async function() {
    deepAR.switchEffect('./effects/look2');
    await delay(33);
    await processPhoto(image);
  }
  document.getElementById('remove-makeup-filter').onclick = function() {
    deepAR.clearEffect();
    deepAR.processImage(image);
  }
  document.getElementById('download-photo').onclick = async function() {
    const screenshot = await deepAR.takeScreenshot();
    const a = document.createElement('a');
    a.href = screenshot;
    a.download = 'photo.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  
})();
