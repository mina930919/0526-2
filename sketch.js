let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let gesture = '';

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 初始化 facemesh
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  // 初始化 handpose
  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    handPredictions = results;
    detectGesture();
  });
}

function modelReady() {
  console.log('模型載入完成');
}

function draw() {
  image(video, 0, 0, width, height);

  // 繪製臉部辨識結果
  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    // 根據手勢決定圓圈的位置
    if (gesture === '剪刀') {
      // 顯示在額頭 (第10點)
      drawCircle(keypoints[10], [255, 0, 0], 25);
    } else if (gesture === '石頭') {
      // 顯示在左右眼睛 (第33點和第263點)
      drawCircle(keypoints[33], [0, 255, 0], 25);
      drawCircle(keypoints[263], [0, 255, 0], 25);
    } else if (gesture === '布') {
      // 顯示在左右臉頰 (第234點和第454點)
      drawCircle(keypoints[234], [0, 0, 255], 25);
      drawCircle(keypoints[454], [0, 0, 255], 25);
    }
  }

  // 顯示手勢辨識結果
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(gesture, width / 2, height - 50);
}

function drawCircle(point, color, size = 20) {
  const [x, y] = point;
  noFill();
  stroke(...color);
  strokeWeight(4);
  ellipse(x, y, size, size);
}

function detectGesture() {
  if (handPredictions.length > 0) {
    const landmarks = handPredictions[0].landmarks;

    // 簡單判斷剪刀、石頭、布
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const distanceThumbIndex = dist(
      thumbTip[0],
      thumbTip[1],
      indexTip[0],
      indexTip[1]
    );
    const distanceIndexMiddle = dist(
      indexTip[0],
      indexTip[1],
      middleTip[0],
      middleTip[1]
    );

    if (distanceThumbIndex < 50 && distanceIndexMiddle < 50) {
      gesture = '石頭';
    } else if (distanceThumbIndex > 50 && distanceIndexMiddle > 50) {
      gesture = '剪刀';
    } else {
      gesture = '布';
    }
  }
}
