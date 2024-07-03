function xywh2xyxy(x) {
  // Convert boxes from [x, y, w, h] to [x1, y1, x2, y2] where xy1=top-left, xy2=bottom-right
  var y = [];
  y[0] = x[0] - x[2] / 2;  // top left x
  y[1] = x[1] - x[3] / 2;  // top left y
  y[2] = x[0] + x[2] / 2;  // bottom right x
  y[3] = x[1] + x[3] / 2;  // bottom right y
  return y;
}

export function non_max_suppression(res, conf_thresh = 0.50, iou_thresh = 0.2, max_det = 300) {
  const selected_detections = [];

  for (let i = 0; i < res.length; i++) {

    var box = res[i].slice(0, 4);
    var klass = res[i][5];
    const score = res[i][4];
    const keypoints = res[i].slice(6);

    let object = xywh2xyxy(box);
    let addBox = true;

    for (let j = 0; j < selected_detections.length; j++) {
      let selectedBox = xywh2xyxy(selected_detections[j].box);

      let intersectionXmin = Math.max(object[0], selectedBox[0]);
      let intersectionYmin = Math.max(object[1], selectedBox[1]);
      let intersectionXmax = Math.min(object[2], selectedBox[2]);
      let intersectionYmax = Math.min(object[3], selectedBox[3]);
      let intersectionWidth = Math.max(0, intersectionXmax - intersectionXmin);
      let intersectionHeight = Math.max(0, intersectionYmax - intersectionYmin);
      let intersectionArea = intersectionWidth * intersectionHeight;
      let boxArea = (object[2] - object[0]) * (object[3] - object[1]);
      let selectedBoxArea = (selectedBox[2] - selectedBox[0]) * (selectedBox[3] - selectedBox[1]);
      let unionArea = boxArea + selectedBoxArea - intersectionArea;

      let iou = intersectionArea / unionArea;
      if (iou >= iou_thresh) {
        addBox = false;
        break;
      }
    }

    if (addBox) {
      const row = {
        box: box,
        score: score,
        klass: klass,
        keypoints: keypoints
      };
      selected_detections.push(row);
    }
  }

  return selected_detections;
}