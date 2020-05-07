// event stream init
/* globals ReconnectingEventSource */
let selectedLayer = "conv1";

function updateInputFrame(result) {
    let shape = result.shape;
    let data = result.image_data;
    console.log(result);
    let inputCanvas = document.getElementById("input_canvas");
    inputCanvas.width = shape[1];
    inputCanvas.height = shape[0];
    let ctx = inputCanvas.getContext("2d");
    let imageData = ctx.createImageData(shape[0], shape[1]);
    for (let i = 0; i < shape[1]; i++) {
        for (let j = 0; j < shape[0]; j++) {
            let index = (j + i * shape[1]) * 4;
            imageData.data[index + 0] = data[i][j][0];
            imageData.data[index + 1] = data[i][j][1];
            imageData.data[index + 2] = data[i][j][2];
            imageData.data[index + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function updateLayerData(result) {
    let shape = result.shape;
    let data = result.data;
    let layer = result.selected_layer;
    console.log(result);
    let layerCanvas;
    $("#" + layer).empty();
    for (var numberLayer = 0; numberLayer < shape[0]; numberLayer++) {
        layerCanvas = document.createElement("CANVAS");
        layerCanvas.width = shape[2];
        layerCanvas.height = shape[1];
        let ctx = layerCanvas.getContext("2d");
        let imageData = ctx.createImageData(shape[1], shape[2]);
        for (let i = 0; i < shape[2]; i++) {
            for (let j = 0; j < shape[1]; j++) {
                let index = (j + i * shape[2]) * 4;
                imageData.data[index + 0] = data[numberLayer][i][j][0];
                imageData.data[index + 1] = data[numberLayer][i][j][1];
                imageData.data[index + 2] = data[numberLayer][i][j][2];
                imageData.data[index + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        layerCanvas.className = "layer_canvas";
        layerCanvas.setAttribute("name", layer + ":" + numberLayer.toString());
        // layerCanvas.width = 55;
        // layerCanvas.height = 55;
        $("#" + layer).append(layerCanvas);
        // $("#" + layer).append(layerCanvas);
    }
    let lastActive = "";
    $(".layer_canvas").click((event) => {
        let target = event.target;
        if (lastActive !== "" && lastActive !== target) {
            lastActive.classList.remove("active");
            if (lastActive.classList.contains("layer-zoom")) {
                lastActive.classList.remove("layer-zoom")
            }
        }
        if (target.classList.contains("active")) {
            if (target.classList.contains("layer-zoom")) {
                target.classList.remove("layer-zoom");
            } else {
                target.classList.add("layer-zoom");
            }
        } else {
            target.classList.add("active");
        }
        lastActive = target;
        let name = target.getAttribute("name");
        let number = parseInt(name.split(":")[1], 10);
        updateSelectedChannelImg(data[number], [shape[1], shape[2]]);
        // updateJpgvis(event.target.getAttribute("name"));
        let updateSelectedUnit = $.ajax({url: "/api/update_selected_unit/", method: "POST", data: {"number": number}});
        updateSelectedUnit.done(result => console.log(result));
        listOfFunction.updateJpgvis(target.getAttribute("name"));

        // updateBackPane(number);
    });
}

//change layer width
$("#zoom_layer").change(event => {
    let value = event.target.value;
    $('.layer_canvas').css('width', `${value}%`);
});

function updateSelectedChannelImg(data, shape) {
    let selectedChannelCanvas = document.getElementById("selected_channel_canvas");
    selectedChannelCanvas.width = shape[1];
    selectedChannelCanvas.height = shape[0];
    let ctx = selectedChannelCanvas.getContext("2d");
    let imageData = ctx.createImageData(shape[0], shape[1]);
    for (let i = 0; i < shape[1]; i++) {
        for (let j = 0; j < shape[0]; j++) {
            let index = (j + i * shape[1]) * 4;
            imageData.data[index + 0] = data[i][j][0];
            imageData.data[index + 1] = data[i][j][1];
            imageData.data[index + 2] = data[i][j][2];
            imageData.data[index + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

let arrowFunctionUpdateJpgvis = (name) => {
    let layer = name.split(":")[0];
    let number = name.split(":")[1];
    if (layer === "fc6" || layer === "fc7") {
        return;
    }
    layer = layer.replace('pool', "conv");
    layer = layer.replace('norm', "conv");
    number = "0".repeat(4 - number.length) + number;
    $("#max_deconv").attr("src", "/media/max_deconv/" + layer + "/" + layer + "_" + number + ".jpg");
    $("#top_img").attr("src", "/media/max_im/" + layer + "/" + layer + "_" + number + ".jpg");
    $("#regularized").attr("src", "/media/regularized_opt/" + layer + "/" + layer + "_" + number + "_montage.jpg");
};

$("#bprob_dconv").click(event => {
    let toggleBackMode = $.ajax({url: "/api/update_back_mode/", method: "POST", data: {"toggle": true}});
    toggleBackMode.done(result => console.log(result));
});
let getBackPaneData = () => {
    let backPaneData = $.ajax({url: "/api/back_pane/", method: "GET"});
    backPaneData.done(result => updateBackPaneImage(result));
};
let updateBackPaneImage = (result) => {
    let shape = result.shape;
    let data = result.data;
    let backCanvas = document.getElementById("back_canvas");
    backCanvas.width = shape[1];
    backCanvas.height = shape[0];
    let ctx = backCanvas.getContext("2d");
    let imageData = ctx.createImageData(shape[0], shape[1]);
    for (let i = 0; i < shape[1]; i++) {
        for (let j = 0; j < shape[0]; j++) {
            let index = (j + i * shape[1]) * 4;
            imageData.data[index + 0] = data[i][j][0];
            imageData.data[index + 1] = data[i][j][1];
            imageData.data[index + 2] = data[i][j][2];
            imageData.data[index + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

$("#layers li").click(event => {
    let name = $(event.target).attr("name");
    let changeLayer = $.ajax({url: "/api/change_layer/", method: "POST", data: {"name": name}});
    changeLayer.done(event => {
        console.log(event);
        $("#zoom_layer").val(10);
    });
});
let getLayerData = () => {
    let getLayerData = $.ajax({url: "/api/layer_data/", method: "GET"});
    getLayerData.done(updateLayerData);
};
//input image change
$(".input-image-btn").click(event => {
    let nextInputImage = $.ajax({
        url: "/api/change_input_image/",
        method: "POST",
        data: {"command": event.currentTarget.name}
    });
    nextInputImage.done(result => console.log(result));
});
let getInputImageData = () => {
    let getInputFrame = $.ajax({url: "/api/input_frame/", method: "GET"});
    getInputFrame.done(updateInputFrame);
};
// new problabel
let updateLabelPane = (result => {
    console.log(result);
    let data = result.data;
    let probLabelDiv = $("#prob_label");
    probLabelDiv.empty();
    Object.values(data).forEach((value) => {
        let spanLabel = document.createElement("span");
        if (value[1]) {
            spanLabel.classList.add("green-text");
            spanLabel.classList.add("text-darken-4");
        }
        spanLabel.innerText = value[0];
        probLabelDiv.append(spanLabel);
        probLabelDiv.append(document.createElement("br"));
    });
});
let getProbLabel = () => {
    let getLabelData = $.ajax({url: "/api/prob_label/", method: "GET"});
    getLabelData.done(updateLabelPane);
};

let listOfFunction = {
    "updateJpgvis": arrowFunctionUpdateJpgvis,
    "backPane": getBackPaneData,
    "layerData": getLayerData,
    "inputFrameUpdate": getInputImageData,
    "probLabel": getProbLabel
};

// caffevis init
let get_input_frame = $.ajax({url: "/api/input_frame/", method: "GET"});
get_input_frame.done(updateInputFrame);
let get_layer_data = $.ajax({url: "/api/layer_data/", method: "GET"});
get_layer_data.done(updateLayerData);
// sse connection
var es = new ReconnectingEventSource('/events/');
es.addEventListener("update", e => {
    let temp = JSON.parse(e.data);
    let type = temp.type;
    if (type in listOfFunction) {
        listOfFunction[type]();
    }
}, false);