function update_input_frame(result) {
    let shape = result.shape;
    let data = result.image_data;
    console.log(result);
    let input_canvas = document.getElementById("input_canvas");
    input_canvas.width = shape[1];
    input_canvas.height = shape[0];
    let ctx = input_canvas.getContext("2d");
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

function update_layer_data(result) {
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
    let last_active = "";
    $(".layer_canvas").click((event) => {
        if (last_active != "") {
            last_active.classList.remove("active");
        }
        event.target.classList.add("active");
        last_active = event.target;
        let name = event.target.getAttribute("name");
        let number = parseInt(name.split(":")[1], 10);
        update_selected_channel_img(data[number], [shape[1], shape[2]]);
        update_jpgvis(event.target.getAttribute("name"));
        update_back_pane(number)
    })
}

function update_selected_channel_img(data, shape) {
    let selected_channel_canvas = document.getElementById("selected_channel_canvas");
    selected_channel_canvas.width = shape[1];
    selected_channel_canvas.height = shape[0];
    let ctx = selected_channel_canvas.getContext("2d");
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

function update_jpgvis(name) {
    console.log(name.split(":"))
    let layer = name.split(":")[0];
    let number = name.split(":")[1];
    number = "0".repeat(4 - number.length) + number;
    $("#max_deconv").attr("src", "/media/max_deconv/" + layer + "/" + layer + "_" + number + ".jpg");
    $("#top_img").attr("src", "/media/max_im/" + layer + "/" + layer + "_" + number + ".jpg");
    $("#regularized").attr("src", "/media/regularized_opt/" + layer + "/" + layer + "_" + number + "_montage.jpg");
}

function update_back_pane(number) {
    console.log("in back pane")
    let get_back_data = $.ajax({url: "/api/back_pane/", method: "POST", data: {"number": number}});
    get_back_data.done(result => {
        let shape = result.shape;
        let data = result.data;
        console.log("back update : ",result);
        let back_canvas = document.getElementById("back_canvas");
        back_canvas.width = shape[1];
        back_canvas.height = shape[0];
        let ctx = back_canvas.getContext("2d");
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