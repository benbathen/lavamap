
let currentObject = null;
const mouseDownPos = new THREE.Vector2(0, 0);
let isMouseDown = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 24, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));
coloredMeshes = new Array();

const renderer = new THREE.WebGLRenderer();
document.getElementsByClassName("flex-container")[0].appendChild(renderer.domElement);

const raycaster = new THREE.Raycaster();

renderer.domElement.style.flex = 3;
renderer.domElement.addEventListener("mousedown", onMouseDown);
renderer.domElement.addEventListener('wheel', (event) => { camera.position.y += event.deltaY / 40; console.log(camera.position.z); });
renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('mouseup', onMouseUp);


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


function createObject(type, intersectPoint) {
    let geometry = new THREE.CylinderGeometry(5, 5, 20, 32);
    let material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    let cylinder = new THREE.Mesh(geometry, material);
    let cube = new THREE.Mesh(geometry, material);
    let cone = new THREE.Mesh(geometry, material);

    switch (type.value) {
        case "redCylinder":
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
            material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
            cylinder = new THREE.Mesh(geometry, material);
            coloredMeshes.push(cylinder);
            currentObject = cylinder;
            scene.add(cylinder);
            cylinder.position.copy(intersectPoint);
            break;
        case "blueBox":
            geometry = new THREE.BoxGeometry(1, 1, 1);
            material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
            let cube = new THREE.Mesh(geometry, material);
            currentObject = cube;
            coloredMeshes.push(cube);
            scene.add(cube);
            cube.position.copy(intersectPoint);
            break;
        case "yellowCone":
            geometry = new THREE.ConeGeometry(0.5, 1, 24);
            material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
            let cone = new THREE.Mesh(geometry, material);
            cone.position.y += 0.5;
            currentObject = cone;
            coloredMeshes.push(cone);
            scene.add(cone);
            cone.position.copy(intersectPoint);
            break;
        default:
            console.log('invalid geometry type');
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
    }
}

function removeSelected() {
    if (currentObject) {
        scene.remove(currentObject);
    }else{
        if( coloredMeshes.length ){
            scene.remove(coloredMeshes.pop());
        }
    }
}

function isRightClick(e) {
    let isRightMB;
    e = e || window.event;

    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3;
    else if ("button" in e)  // IE, Opera 
        isRightMB = e.button == 2;

    return isRightMB;
}

function resetHighlights(){
    scene.traverse((obj) =>  {if (obj.type === "Mesh") { obj.material.emissive = new THREE.Color(0x000000); } });
}

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
            if (intersects[0].object === gridHelper) {
                createObject(document.getElementById("typeDropdown"), intersects[0].point);
            } else if (intersects[0].object.type = "Mesh") {
                currentObject = intersects[0].object;
                currentObject.material.emissive = new THREE.Color(0x00FF00);
            }
        }
    } else if (isRightClick(event)) {
        mouseDownPos.copy(mouse);
    }
}

function onMouseMove(event) {
    const mouse = new THREE.Vector2(0, 0);
    // Get screen-space x/y
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / renderer.domElement.clientHeight) * 2 + 1;

    if (isMouseDown == true && isRightClick(event)) {
        let diff = mouseDownPos.sub(mouse);
        camera.rotation.x += THREE.MathUtils.degToRad(diff.y * 40);
        camera.rotation.y -= THREE.MathUtils.degToRad(diff.x * 40);
        mouseDownPos.copy(mouse);
    } else if (isMouseDown == true && !isRightClick(event)) {
        let diff = mouseDownPos.sub(mouse);
        camera.position.x += diff.x * 20;
        camera.position.z -= diff.y * 20;
        mouseDownPos.copy(mouse);
    }
}

function onMouseUp(event) {
    isMouseDown = false;
}
