const tf = require('@tensorflow/tfjs-node')
const faceapi = require('@vladmandic/face-api');
const fs = require('fs');

const { faceDetectionNet, faceDetectionOptions } = require("./commons/faceDetection")
const saveFile = require("./commons/saveFile")
//const canvas = require("./commons/env")

const REFERENCE_IMAGE = fs.readFileSync('./src/images/vic1.JPG')
const QUERY_IMAGE = fs.readFileSync('./src/images/perfil.JPG')

const readImage = path => {
  //reads the entire contents of a file.
  //readFileSync() is synchronous and blocks execution until finished.
  const imageBuffer = fs.readFileSync(path);
  //Given the encoded bytes of an image,
  //it returns a 3D or 4D tensor of the decoded image. Supports BMP, GIF, JPEG and PNG formats.
  const tfimage = tfnode.node.decodeImage(imageBuffer);
  return tfimage;
 }

const test = async (req, res) => {

  await faceDetectionNet.loadFromDisk('./src/weights')
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./src/weights')
  await faceapi.nets.faceRecognitionNet.loadFromDisk('./src/weights')
  
  const referenceImage = tf.node.decodeImage(REFERENCE_IMAGE)
  const queryImage = tf.node.decodeImage(QUERY_IMAGE)
  
  const resultsRef = await faceapi.detectAllFaces(referenceImage, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors()
  const resultsQuery = await faceapi.detectAllFaces(queryImage, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors()

  //console.log(resultsQuery)
  const faceMatcher = new faceapi.FaceMatcher(resultsRef)

  const labels = faceMatcher.labeledDescriptors
    .map(ld => ld.label)
  const refDrawBoxes = resultsRef
    .map(res => res.detection.box)
    .map((box, i) => new faceapi.draw.DrawBox(box, { label: labels[i] }))
  //const outRef = faceapi.createCanvasFromMedia(referenceImage)
  //refDrawBoxes.forEach(drawBox => drawBox.draw(outRef))

  //saveFile('referenceImage.jpg', outRef.toBuffer('image/jpeg'))

  const queryDrawBoxes = resultsQuery.map(res => {
    const bestMatch = faceMatcher.findBestMatch(res.descriptor)
    return new faceapi.draw.DrawBox(res.detection.box, { label: bestMatch.toString() })
  })
  //const outQuery = faceapi.createCanvasFromMedia(queryImage)
  //queryDrawBoxes.forEach(drawBox => drawBox.draw(outQuery))
  //saveFile('queryImage.jpg', outQuery.toBuffer('image/jpeg'))
  console.log('done, saved results to out/queryImage.jpg')
  return res.status(200).json({ result: queryDrawBoxes });
}

module.exports = { test };
