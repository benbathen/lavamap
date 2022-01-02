

let currentObject = null;
const mouseDownPos = new THREE.Vector2(0, 0);
let isMouseDown = false;
let isTranslating = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 24, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));
const coloredMeshes = new Array();

const renderer = new THREE.WebGLRenderer({ alpha: true });
scene.background = new THREE.Color(0x384C55);
document.getElementsByClassName("flex-container")[0].appendChild(renderer.domElement);

const raycaster = new THREE.Raycaster();

function addEventListeners() {
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener('wheel', (event) => { camera.position.y += event.deltaY / 40; });
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', handleKey);
    document.getElementById("translateBtn").addEventListener('click', translate);
    document.getElementById("up").addEventListener('click', move);
    document.getElementById("down").addEventListener('click', move);
    document.getElementById("left").addEventListener('click', move);
    document.getElementById("right").addEventListener('click', move);
    document.getElementById("rotateForwardBtn").addEventListener('click', rotate);
    document.getElementById("rotateBackBtn").addEventListener('click', rotate);
    document.getElementById("randBtn").addEventListener('click', generateRandomObjects);
}
addEventListeners();

function handleKey(event) {
    switch (event.code) {
        case 'Delete':
            removeSelected();
            break;
        case 'KeyF':
            if (currentObject !== undefined) {
                const targetPos = new THREE.Vector3();
                currentObject.getWorldPosition(targetPos);
                targetPos.y += 5;
                camera.position.copy(targetPos);
                camera.lookAt(currentObject.position);
            }
            break;
        case 'KeyA':

            camera.position.set(0, 24, 0);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            break;
        default:
    }
}

const size = 24;
const divisions = 24;

const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

// create a key light
var pointLight1 = new THREE.PointLight(0xFFFFFF);
pointLight1.position.set(0, 30, 20);
pointLight1.intensity = 1;
scene.add(pointLight1);

//returns whether the canvas needs to be resized
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

// animation loop, also automatically resizes the canvas
function animate() {
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();


function createObject(objectType, intersectPoint) {
    let geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
    let material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    let cylinder = new THREE.Mesh(geometry, material);
    let cube = new THREE.Mesh(geometry, material);
    let cone = new THREE.Mesh(geometry, material);

    switch (objectType) {
        case "redCylinder":
            break;
        case "redCylinder":
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
            material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
            cylinder = new THREE.Mesh(geometry, material);
            coloredMeshes.push(cylinder);
            scene.add(cylinder);
            cylinder.position.copy(intersectPoint);
            return cylinder;
        case "blueBox":
            geometry = new THREE.BoxGeometry(1, 1, 1);
            material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
            let cube = new THREE.Mesh(geometry, material);
            coloredMeshes.push(cube);
            scene.add(cube);
            cube.position.copy(intersectPoint);
            return cube;
        case "yellowCone":
            geometry = new THREE.ConeGeometry(0.5, 1, 24);
            material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
            let cone = new THREE.Mesh(geometry, material);
            cone.position.y += 0.5;
            coloredMeshes.push(cone);
            scene.add(cone);
            cone.position.copy(intersectPoint);
            return cone;
        default:
            console.warn(objectType.value + ' is not a valid geometry type');
    }
}

function getAxisToObject() {
    const currentObjectWorldPosition = new THREE.Vector3();
    const cameraWorldPosition = new THREE.Vector3();
    currentObject.getWorldPosition(currentObjectWorldPosition);
    camera.getWorldPosition(cameraWorldPosition);
    return currentObjectWorldPosition.sub(cameraWorldPosition).normalize();
}

function translate() {
        const dragControls = new THREE.DragControls(coloredMeshes, camera, renderer.domElement);
        document.body.style.cursor = 'move';
        dragControls.addEventListener('dragstart', (event) => {
            event.object.material.emissive.set(0x00FF00);
        });
        dragControls.addEventListener('dragend', (event) => {
            dragControls.deactivate();
            addEventListeners();
            event.object.material.emissive.set(0x000000);
        });
}

function move(event) {
    let axis = "x"
    switch (event.target.id) {
        case "up":
            axis = 'y';
            value = 1;
            break;
        case "down":
            axis = 'y';
            value = -1;
            break;
        case "left":
            axis = 'x';
            value = -1;
            break;
        case "right":
            axis = 'x';
            value = 1;
            break;
        default:
            break;

    }
    const cameraWorldPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraWorldPosition);
    geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
    let cube = new THREE.Mesh(geometry, material);
    camera.add(cube);
    cube.position[axis] += 1;
    const upCameraWorldPosition = new THREE.Vector3();
    cube.getWorldPosition(upCameraWorldPosition);
    upCameraWorldPosition.sub(cameraWorldPosition);
    currentObject.position.add(upCameraWorldPosition.normalize().multiplyScalar(value));
}



// rotate the selected object 45 degrees on the axis vector between the camera and the object.
function rotate(event) {
    if (currentObject !== undefined) {
        const axisVec = getAxisToObject();
        let angle = 45;
        if (event.target.id === "rotateBackBtn") { angle *= -1; }
        currentObject.rotateOnWorldAxis(axisVec, THREE.MathUtils.degToRad(angle));
    } else {
        alert("select an object to rotate first");
    }
}

function removeAll() {
    // reverse loop to remove all items because in each iteration the .children array changes once you do a 
    // .remove() from the start and the indexing of that array changes.
    for (var i = scene.children.length - 1; i >= 0; i--) {
        obj = scene.children[i];
        if (obj.type == 'Mesh' && obj !== gridHelper) {
            scene.remove(obj);
        }
        currentObject = undefined;
    }
}

function removeSelected() {
    if (currentObject) {
        const index = coloredMeshes.indexOf(currentObject);
        coloredMeshes.splice(index, 1);
        scene.remove(currentObject);
    } else {
        if (coloredMeshes.length) {
            const last = coloredMeshes.pop();
            scene.remove(last);
        }
    }
}


// function to determine if it's a left or right click
function isRightClick(event) {
    let isRightMB;
    event = event || window.event;

    if ("which" in event)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = event.which == 3;
    else if ("button" in e)  // IE, Opera 
        isRightMB = event.button == 2;
    return isRightMB;
}

function resetHighlights() {
    scene.traverse((obj) => {
        if (obj && obj.type === "Mesh" && obj.material && obj.material.type === "MeshLambertMaterial" & !isTranslating) {
            obj.material.emissive = new THREE.Color(0x000000);
        }
    });
}

// event handler for the mouse down 
function onMouseDown(event) {
    isMouseDown = true;
    resetHighlights();
    const mouse = new THREE.Vector2(0, 0);
    // Get screen-space x/y
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / renderer.domElement.clientHeight) * 2 + 1;
    // if the user left clicks...
    if (!isRightClick(event)) {
        // Perform raycast
        raycaster.setFromCamera(mouse, camera);
        // See if the ray from the camera into the world hits our mesh
        const intersects = raycaster.intersectObjects(scene.children, true);

        // Check if an intersection took place
        if (intersects.length === 0) {
            mouseDownPos.copy(mouse);
        } else {
            const meshIndex = intersects.findIndex(item => item.object.type === "Mesh");
            // if you hit an object highlight it so the user knows it's selected
            if (meshIndex !== -1) {
                currentObject = intersects[meshIndex].object;
                if (currentObject &&
                    currentObject.material &&
                    currentObject.type === "Mesh" &&
                    currentObject.material.type === "MeshLambertMaterial") {
                    currentObject.material.emissive = new THREE.Color(0x00FF00);
                }

            } else if (intersects.findIndex(item => item.object.type === "GridHelper") !== -1) {
                currentObject = createObject(document.getElementById("typeDropdown").value, intersects[0].point);
            }
        }
    } else {
        mouseDownPos.copy(mouse);
    }
}

//event handler for the mouse move
function onMouseMove(event) {
    const mouse = new THREE.Vector2(0, 0);
    // Get screen-space x/y
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / renderer.domElement.clientHeight) * 2 + 1;

    if (isMouseDown && isRightClick(event)) {
        let diff = mouseDownPos.sub(mouse);
        camera.rotation.x += THREE.MathUtils.degToRad(diff.y * 40);
        camera.rotation.y -= THREE.MathUtils.degToRad(diff.x * 40);
        mouseDownPos.copy(mouse);
    } else if (isMouseDown && !isRightClick(event) && !isTranslating) {
        let diff = mouseDownPos.sub(mouse);
        camera.position.x += diff.x * 20;
        camera.position.z -= diff.y * 20;
        mouseDownPos.copy(mouse);
    } else if (isMouseDown && isTranslating) {
        currentObject.position
    }

}

function onMouseUp(event) {
    isMouseDown = false;
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function generateRandomObjects() {
    const objectTypes = ["redCylinder", "blueBox", "yellowCone"];
    for (let i = 0; i < 100; i++) {
        console.log(Math.floor(Math.random() * objectTypes.length));
        const limit = 12;
        const randVec = new THREE.Vector3(getRandomArbitrary(-limit, limit), 0, getRandomArbitrary(-limit, limit) );
        const obj = createObject(objectTypes[Math.floor(Math.random() * objectTypes.length)], randVec);
    }
}


