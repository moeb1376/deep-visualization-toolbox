
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
        $("#" + layer).append(layerCanvas);
        // $("#" + layer).append(layerCanvas);
    }
    let lastActive = "";
    $(".layer_canvas").click((event) => {
        if (lastActive != "") {
            lastActive.classList.remove("active");
        }
        event.target.classList.add("active");
        lastActive = event.target;
        let name = event.target.getAttribute("name");
        let number = parseInt(name.split(":")[1], 10);
        updateSelectedChannelImg(data[number], [shape[1], shape[2]]);
        // updateJpgvis(event.target.getAttribute("name"));
        listOfFunction.updateJpgvis(event.target.getAttribute("name"));
        updateBackPane(number)
    })
}

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

function updateJpgvis(name) {
    console.log(name.split(":"))
    let layer = name.split(":")[0];
    let number = name.split(":")[1];
    number = "0".repeat(4 - number.length) + number;
    $("#max_deconv").attr("src", "/media/max_deconv/" + layer + "/" + layer + "_" + number + ".jpg");
    $("#top_img").attr("src", "/media/max_im/" + layer + "/" + layer + "_" + number + ".jpg");
    $("#regularized").attr("src", "/media/regularized_opt/" + layer + "/" + layer + "_" + number + "_montage.jpg");
}

function updateBackPane(number) {
    console.log("in back pane")
    let getBackData = $.ajax({url: "/api/back_pane/", method: "POST", data: {"number": number}});
    getBackData.done(result => {
        let shape = result.shape;
        let data = result.data;
        console.log("back update : ",result);
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
    })
}

let arrowFunctionUpdateJpgvis = (name)=>{
    let layer = name.split(":")[0];
    let number = name.split(":")[1];
    number = "0".repeat(4 - number.length) + number;
    $("#max_deconv").attr("src", "/media/max_deconv/" + layer + "/" + layer + "_" + number + ".jpg");
    $("#top_img").attr("src", "/media/max_im/" + layer + "/" + layer + "_" + number + ".jpg");
    $("#regularized").attr("src", "/media/regularized_opt/" + layer + "/" + layer + "_" + number + "_montage.jpg");
}
let listOfFunction={"updateJpgvis":arrowFunctionUpdateJpgvis}