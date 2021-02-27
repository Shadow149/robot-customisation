import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { components } from './component_costs';
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { Device } from './device';
import { $ } from 'protractor';
// import * as cjson from 'compressed-json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  budget = 2500;
  title = 'robot-customisation';
  components = components;

  distCost = 50;
  wheelCost = 200;

  previousWheelNumber = 2;
  numberOfWheels = 2;
  wheelsIterator = Array(this.numberOfWheels).fill(0);

  previousDistNumber = 4;
  numberOfDists = 4;
  distsIterator = Array(this.numberOfDists).fill(0);

  cost = this.numberOfWheels * this.wheelCost + this.numberOfDists * this.distCost;

  selectedDevices = {};

  @ViewChild('three') threeDiv: ElementRef;  
  @ViewChild('fileNameInput') fileNameField;  
  
  robotModel: THREE.Mesh;
  deviceModels = {};
  scene = new THREE.Scene();

  control: TransformControls;
  showLables = true;
  labelRenderer: CSS2DRenderer;
  controls: OrbitControls;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;

  fileName: string = "MyAwesomeRobot";

  // Create THREE.js view
  ngAfterViewInit() {
    /*
    
    */
    
    let body = this;

    let width_ratio = 3.2;
    let height_ratio = 2.16;
    
    init();
    animate();

    function init(){

      body.camera = new THREE.PerspectiveCamera( 45, (window.innerWidth/width_ratio) / (window.innerHeight/height_ratio), 0.1, 200 );
      body.camera.position.set( 1, 1, 1 );
      
      const skyColor = 0xFFFFFF;  // light blue
      const groundColor = 0x000000;  // brownish orange
      const intensity = 1;

      const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);

      body.scene.add(light);

      const geometry = new THREE.CylinderGeometry(0.37,0.37,0.4,100);
      const texture = new THREE.TextureLoader().load("./../assets/textures/top.png");
      texture.rotation = 0;
      const top_material = new THREE.MeshPhongMaterial( { map: texture } );
      const side_material = new THREE.MeshPhongMaterial( { color: 0xffffff, opacity: 0.5, transparent: true} );
      const bot_material = new THREE.MeshPhongMaterial( { color: 0xffffff } );
      const materials = [side_material,top_material,bot_material]
      body.robotModel = new THREE.Mesh( geometry, materials );
      body.robotModel.position.set(0,0.1,0);
      body.scene.add( body.robotModel );

      body.renderer = new THREE.WebGLRenderer();
      body.renderer.setPixelRatio( window.devicePixelRatio );
			body.renderer.setSize( (window.innerWidth/width_ratio), (window.innerHeight/height_ratio) );
      body.threeDiv.nativeElement.appendChild( body.renderer.domElement );
      
      body.labelRenderer = new CSS2DRenderer();
      body.labelRenderer.setSize( (window.innerWidth/width_ratio), (window.innerHeight/height_ratio) );
      body.labelRenderer.domElement.style.position = 'absolute';
      body.labelRenderer.domElement.style.top = '0px'; 
      body.labelRenderer.domElement.style.display = 'block';
      body.threeDiv.nativeElement.appendChild( body.labelRenderer.domElement );

      body.controls = new OrbitControls( body.camera, body.labelRenderer.domElement );

      // const axesHelper = new THREE.AxesHelper( 1 );
      // body.scene.add( axesHelper );

      window.addEventListener( 'resize', onWindowResize, false );

    }
      function onWindowResize(){
      
          body.camera.aspect = (window.innerWidth/width_ratio) / (window.innerHeight/height_ratio);
          body.camera.updateProjectionMatrix();
          body.renderer.setSize( (window.innerWidth/width_ratio), (window.innerHeight/height_ratio) );
          body.labelRenderer.setSize( (window.innerWidth/width_ratio), (window.innerHeight/height_ratio) );
      
      }

    function animate() {
      requestAnimationFrame( animate );
      body.labelRenderer.render( body.scene, body.camera );
      body.renderer.render( body.scene, body.camera );
    }

    
  }

  changeFileName($event){
    this.fileName = $event.target.value;
  }

  checkBoxChecked(value){
    this.cost += value;
  }

  withinBudget(value){
    return this.cost + (value) <= this.budget
  }

  onWheelSliderChange($event) {
    if (this.withinBudget((parseInt($event.value) * this.wheelCost) - (this.previousWheelNumber * this.wheelCost))){
      this.previousWheelNumber = this.numberOfWheels;
      this.numberOfWheels = parseInt($event.value);
      this.wheelsIterator = Array(this.numberOfWheels).fill(0);
      if (this.previousWheelNumber - this.numberOfWheels > 0){
        //decreased slider
        console.log("Wheel " + this.previousWheelNumber)
        this.selectedDevices["Wheel " + this.previousWheelNumber].type = "sub";
        this.addSelectedComponent(this.selectedDevices[ "Wheel " + this.previousWheelNumber]);
      }
      this.cost += (this.numberOfWheels * this.wheelCost) - (this.previousWheelNumber * this.wheelCost)
    } else {
      this.previousWheelNumber = this.numberOfWheels;
      $event.value = this.previousWheelNumber;
    }
    
  }
  
  onDistSliderChange($event) {
    if (this.withinBudget((parseInt($event.value) * this.distCost) - (this.previousDistNumber * this.distCost))){
      this.previousDistNumber = this.numberOfDists;
      this.numberOfDists = parseInt($event.value);
      this.distsIterator = Array(this.numberOfDists).fill(0);
      if (this.previousDistNumber - this.numberOfDists > 0){
        //decreased slider
        this.selectedDevices["Distance Sensor " + this.previousDistNumber].type = "sub";
        this.addSelectedComponent(this.selectedDevices["Distance Sensor " + this.previousDistNumber]);
      }
      this.cost += (this.numberOfDists * this.distCost) - (this.previousDistNumber * this.distCost)
    } else {
      this.previousDistNumber = this.numberOfDists;
      $event.value = this.previousDistNumber;
    }
  }

  destoryDevice(device) {
    var body = this;
    document.getElementById(this.selectedDevices[device.dictName].customName).remove();
    body.scene.remove(this.deviceModels[device.dictName]);
    delete this.selectedDevices[device.dictName];
    delete this.deviceModels[device.dictName];
  }

  addSelectedComponent($event){
    var body = this;
    if ($event.type != "sub"){
      this.selectedDevices[$event.dictName] = $event;
    } else {
      this.destoryDevice($event);
      return;
    }

    // console.log("asdasdasd")
    // console.log(this.selectedDevices)
    // let json = Object.assign({},this.selectedDevices)
    // for(let component in json){
    //   json[component] = {
    //     "name": json[component].name,
    //     "customName": json[component].customName,
    //     "pos": [json[component].x,json[component].y,json[component].z],
    //     "ang":[json[component].rx,json[component].ry,json[component].rz,json[component].a]
    //   }
    // }
    // // console.log(json)
    // console.log(JSON.stringify(json))
    // console.log(JSON.stringify(cjson.compress(json)))
    // console.log(btoa(JSON.stringify(this.selectedDevices)))
    // console.log(btoa(JSON.stringify(cjson.compress(json))))

    let model = null;

    if(this.selectedDevices[$event.dictName].name == "Wheel"){
      const wheel_geometry = new THREE.CylinderGeometry(0.205,0.205,0.05, 100);
      const texture = new THREE.TextureLoader().load("./../assets/textures/wheel.png");

      const wheel_material_side = new THREE.MeshPhongMaterial( { map: texture} );
      const wheel_material_top = new THREE.MeshPhongMaterial( { color: 0xffffff, opacity: 0.5, transparent: true} );
      const wheel_material_bot = new THREE.MeshPhongMaterial( { color: 0xffffff, opacity: 0.5, transparent: true} );
        
      const materials = [wheel_material_bot,wheel_material_side,wheel_material_top]
      model = new THREE.Mesh( wheel_geometry, materials );
    }
    else{
      const geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
      const texture = new THREE.TextureLoader().load("./../assets/textures/sensor.png");
      
      const material_top = new THREE.MeshPhongMaterial( {map: texture} );
      const material_bot = new THREE.MeshPhongMaterial( { color: 0xffffff} );
      const material_side = new THREE.MeshPhongMaterial( { color: 0xffffff} );
      const materials = [material_side,material_bot,material_top,material_side,material_side,material_side]

      model = new THREE.Mesh( geometry, materials );
    }
    if (model != null){
      if(this.deviceModels[$event.dictName] == undefined){
        const labelDiv = document.createElement('div');
        labelDiv.id = this.selectedDevices[$event.dictName].customName;
        labelDiv.textContent = this.selectedDevices[$event.dictName].customName;
        labelDiv.style.marginTop = '-1em';
        labelDiv.style.color = 'rgb(255, 255, 255)';
        labelDiv.style.padding = '2px';
        labelDiv.style.background = 'rgba(0, 0, 0, 0.6)';
        const deviceLabel = new CSS2DObject( labelDiv );
        deviceLabel.position.set(0, 0.05, 0);
        model.add(deviceLabel);
        console.log(model)
        model.name = $event.dictName;

        this.deviceModels[$event.dictName] = model; 
        body.scene.add(this.deviceModels[$event.dictName]);

      }

      var eulerRot = new THREE.Euler(0,0,0);
      var rotationVector = new THREE.Vector3(this.selectedDevices[$event.dictName].rx,this.selectedDevices[$event.dictName].ry,this.selectedDevices[$event.dictName].rz);

      this.deviceModels[$event.dictName].rotation.set(eulerRot.x, eulerRot.y, eulerRot.z);

      this.deviceModels[$event.dictName].rotateOnAxis(rotationVector.normalize(), this.selectedDevices[$event.dictName].a);
      console.log(this.deviceModels[$event.dictName].rotation)

      this.deviceModels[$event.dictName].position.set(this.selectedDevices[$event.dictName].x / 1000, this.selectedDevices[$event.dictName].y / 1000, this.selectedDevices[$event.dictName].z / 1000);

      // Update label name
      this.deviceModels[$event.dictName].children[0].element.innerHTML = this.selectedDevices[$event.dictName].customName;
    }
    
  }

  export(){
    var proto_code = `
    PROTO protos [
      field SFVec3f            translation                  0 0 0                    
      field SFRotation         rotation                     0 1 0 0                  
      field SFString           name                         "e-puck"                 
      field SFString           controller                   "" 
      field MFString           controllerArgs               ""                       
      field SFString           customData                   ""                       
      field SFBool             supervisor                   FALSE                    
      field SFBool             synchronization              TRUE                     
      field SFString{"1"}      version                      "1"                      
      field SFFloat            camera_fieldOfView           0.84                     
      field SFInt32            camera_width                 52                       
      field SFInt32            camera_height                39                       
      field SFBool             camera_antiAliasing          FALSE                    
      field SFRotation         camera_rotation              1 0 0 0                  
      field SFFloat            camera_noise                 0.0                      
      field SFFloat            camera_motionBlur            0.0                      
      field SFBool             using_detection_api          FALSE
      field SFInt32            emitter_channel              1                        
      field SFInt32            receiver_channel             1                        
      field MFFloat            battery                      []                       
      field MFNode             turretSlot                   []                       
      field MFNode             groundSensorsSlot            []                       
      field SFBool             kinematic                    FALSE                    
      hiddenField  SFFloat            max_velocity                 6.28
    ]
    {
    %{
      local v1 = fields.version.value:find("^1") ~= nil
      local v2 = fields.version.value:find("^2") ~= nil
      local kinematic = fields.kinematic.value
      local usingDetectionApi = fields.using_detection_api.value
    }%
    Robot {
      translation IS translation
      rotation IS rotation
      children [ 
        
        DEF BATTERY_CONNECTOR Transform {
          rotation 0 1 0 3.14159
          children [
            Shape {
              appearance Copper {
              }
              geometry IndexedFaceSet {
                coord Coordinate {
                  point [
                    0.017813 0.036934 0.02632
                    -0.017776 0.036934 0.026276
                    0.014654 0.036868 0.026266
                    -0.014659 0.036868 0.026289
                    -0.017776 0.00184 0.026276
                    -0.014659 0.001774 0.026289
                    0.017813 0.002054 0.02632
                    0.014654 0.001987 0.026266
                    -0.014659 0.012265 0.026289
                    0.014654 0.012478 0.026266
                    0.00251 0.036993 -0.026929
                    0.00251 0.002646 -0.026929
                    -0.002508 0.036993 -0.026937
                    -0.002508 0.002646 -0.026937
                  ]
                }
                texCoord TextureCoordinate {
                  point [
                    0.7946 0.9656
                    0.6886 0.9674
                    0.6886 0.0287
                    0.7946 0.0269
                    0.9664 0.0287
                    0.9664 0.9731
                    0.8618 0.9713
                    0.8618 0.0269
                    0.0336 0.0269
                    0.3858 0.029
                    0.3858 0.8178
                    0.0336 0.8157
                    0.6214 0.0269
                    0.6214 0.9512
                    0.4529 0.9512
                    0.4529 0.0269
                  ]
                }
                coordIndex [
                  2, 0, 6, 7, -1, 4, 1, 3, 5, -1
                  9, 7, 5, 8, -1, 12, 13, 11, 10, -1
                ]
                texCoordIndex [
                  0, 1, 2, 3, -1, 4, 5, 6, 7, -1
                  8, 9, 10, 11, -1, 12, 13, 14, 15, -1
                ]
              }
            }
            Shape {
              appearance Copper {
              }
              geometry IndexedFaceSet {
                coord Coordinate {
                  point [
                    0.017813 0.036934 0.02632
                    -0.017776 0.036934 0.026276
                    0.014654 0.036868 0.026266
                    -0.014659 0.036868 0.026289
                    -0.017776 0.00184 0.026276
                    -0.014659 0.001774 0.026289
                    0.017813 0.002054 0.02632
                    0.014654 0.001987 0.026266
                    -0.014659 0.012265 0.026289
                    0.014654 0.012478 0.026266
                    0.00251 0.036993 -0.026929
                    0.00251 0.002646 -0.026929
                    -0.002508 0.036993 -0.026937
                    -0.002508 0.002646 -0.026937
                  ]
                }
                texCoord TextureCoordinate {
                  point [
                    0.7946 0.9656
                    0.6886 0.9674
                    0.6886 0.0287
                    0.7946 0.0269
                    0.9664 0.0287
                    0.9664 0.9731
                    0.8618 0.9713
                    0.8618 0.0269
                    0.0336 0.0269
                    0.3858 0.029
                    0.3858 0.8178
                    0.0336 0.8157
                    0.6214 0.0269
                    0.6214 0.9512
                    0.4529 0.9512
                    0.4529 0.0269
                  ]
                }
                ccw FALSE
                coordIndex [
                  2, 0, 6, 7, -1, 4, 1, 3, 5, -1
                  9, 7, 5, 8, -1, 12, 13, 11, 10, -1
                ]
                texCoordIndex [
                  0, 1, 2, 3, -1, 4, 5, 6, 7, -1
                  8, 9, 10, 11, -1, 12, 13, 14, 15, -1
                ]
              }
            }
          ]
        }
        DEF MOTORS Transform {
          translation 0 0.02 0
          rotation 0 0 1 1.5707996938995747
          children [
            Shape {
              appearance PBRAppearance {
                roughness 1
                metalness 0
              }
              geometry Cylinder {
                height 0.04
                radius 0.005
              }
            }
            Shape {
              appearance PBRAppearance {
                roughness 1
              }
              geometry Cylinder {
                height 0.02
                radius 0.0053
              }
            }
          ]
        }
        DEF EPUCK_PLATE Transform {
          translation 0.0002 0.037 0
          rotation 0 1 0 3.14159
          scale 0.01 0.01 0.01
          children [
            Shape {
              appearance DEF EPUCK_SIDE_PRINT_APPEARANCE PBRAppearance {
                baseColor 0.184314 0.635294 0.184314
                roughness 0.4
                metalness 0
              }
              geometry IndexedFaceSet {
                coord Coordinate {
                  point [
                    3.3287 0.152947 1.08156 2.83156 0.152947 2.05725 2.05725 0.152947 2.83156 1.08156 0.152947 3.3287 -1.5299e-07 0.152947 3.5 -1.08156 0.152947 3.3287 -2.05725 0.152947 2.83156 -2.83156 0.152947 2.05725 -3.3287 0.152947 1.08156 -3.5 0.152947 -7.23212e-07 -3.3287 0.152947 -1.08156 -2.83156 0.152947 -2.05725 -2.05725 0.152947 -2.83156 -1.08156 0.152947 -3.3287 2.96236e-06 0.152947 -3.5 1.08156 0.152947 -3.3287 2.05725 0.152947 -2.83156 2.83156 0.152947 -2.05724 3.3287 0.152947 -1.08155 3.5 0.152947 5.20152e-06 3.3287 1.93187e-08 1.08156 2.83156 1.93187e-08 2.05725 2.05725 1.93187e-08 2.83156 1.08156 1.93187e-08 3.3287 -1.5299e-07 1.93187e-08 3.5 -1.08156 1.93187e-08 3.3287 -2.05725 1.93187e-08 2.83156 -2.83156 1.93187e-08 2.05725 -3.3287 1.93187e-08 1.08156 -3.5 1.93187e-08 -7.23212e-07 -3.3287 1.93187e-08 -1.08156 -2.83156 1.93187e-08 -2.05725 -2.05725 1.93187e-08 -2.83156 -1.08156 1.93187e-08 -3.3287 2.96236e-06 1.93187e-08 -3.5 1.08156 1.93187e-08 -3.3287 2.05725 1.93187e-08 -2.83156 2.83156 1.93187e-08 -2.05724 3.3287 1.93187e-08 -1.08155 3.5 1.93187e-08 5.20152e-06 1.00136e-06 1.93187e-08 5.93862e-07
                  ]
                }
                coordIndex [
                  40, 39, 20, -1, 40, 38, 39, -1, 40, 37, 38, -1, 40, 36, 37, -1, 40, 35, 36, -1, 40, 34, 35, -1, 40, 33, 34, -1, 40, 32, 33, -1, 40, 31, 32, -1, 40, 30, 31, -1, 40, 29, 30, -1, 40, 28, 29, -1, 40, 27, 28, -1, 40, 26, 27, -1, 40, 25, 26, -1, 40, 24, 25, -1, 40, 23, 24, -1, 40, 22, 23, -1, 40, 21, 22, -1, 40, 20, 21, -1, 0, 20, 39, 19, -1, 19, 39, 38, 18, -1, 18, 38, 37, 17, -1, 17, 37, 36, 16, -1, 16, 36, 35, 15, -1, 15, 35, 34, 14, -1, 14, 34, 33, 13, -1, 13, 33, 32, 12, -1, 12, 32, 31, 11, -1, 11, 31, 30, 10, -1, 10, 30, 29, 9, -1, 9, 29, 28, 8, -1, 8, 28, 27, 7, -1, 7, 27, 26, 6, -1, 6, 26, 25, 5, -1, 5, 25, 24, 4, -1, 4, 24, 23, 3, -1, 3, 23, 22, 2, -1, 2, 22, 21, 1, -1, 1, 21, 20, 0, -1
                ]
                creaseAngle 0.785398
              }
            }
            Shape {
              appearance PBRAppearance {
                baseColorMap ImageTexture {
                  url [
                    %{ if v2 then }%
                      "textures/e-puck2_plate.jpg"
                    %{ else }%
                      "textures/e-puck1_plate_base_color.jpg"
                    %{ end }%
                  ]
                }
                roughnessMap ImageTexture {
                  url [
                    %{ if v2 then }%
                      "textures/e-puck2_plate.jpg"
                    %{ else }%
                      "textures/e-puck1_plate_roughness.jpg"
                    %{ end }%
                  ]
                }
                metalnessMap ImageTexture {
                  url [
                    %{ if v2 then }%
                      "textures/e-puck2_plate.jpg"
                    %{ else }%
                      "textures/e-puck1_plate_metalness.jpg"
                    %{ end }%
                  ]
                }
                normalMap ImageTexture {
                  url [
                    %{ if v2 then }%
                      "textures/e-puck2_plate.jpg"
                    %{ else }%
                      "textures/e-puck1_plate_normal.jpg"
                    %{ end }%
                  ]
                }
                occlusionMap ImageTexture {
                  url [
                    %{ if v2 then }%
                      "textures/e-puck2_plate.jpg"
                    %{ else }%
                      "textures/e-puck1_plate_occlusion.jpg"
                    %{ end }%
                  ]
                }
              }
              geometry IndexedFaceSet {
                coord Coordinate {
                  point [
                    3.3287 0.152947 1.08156 2.83156 0.152947 2.05725 2.05725 0.152947 2.83156 1.08156 0.152947 3.3287 -1.5299e-07 0.152947 3.5 -1.08156 0.152947 3.3287 -2.05725 0.152947 2.83156 -2.83156 0.152947 2.05725 -3.3287 0.152947 1.08156 -3.5 0.152947 -7.23212e-07 -3.3287 0.152947 -1.08156 -2.83156 0.152947 -2.05725 -2.05725 0.152947 -2.83156 -1.08156 0.152947 -3.3287 2.96236e-06 0.152947 -3.5 1.08156 0.152947 -3.3287 2.05725 0.152947 -2.83156 2.83156 0.152947 -2.05724 3.3287 0.152947 -1.08155 3.5 0.152947 5.20152e-06 1.00136e-06 0.152947 5.93862e-07
                  ]
                }
                texCoord TextureCoordinate {
                  point [
                    0.500977 0.499023 0.977434 0.344213 1.00195 0.499023 0.500977 0.499023 1.00195 0.499023 0.977434 0.653833 0.500977 0.499023 0.977434 0.653833 0.906275 0.79349 0.500977 0.499023 0.906275 0.79349 0.795444 0.904322 0.500977 0.499023 0.795444 0.904322 0.655787 0.97548 0.500977 0.499023 0.655787 0.97548 0.500977 1 0.500977 0.499023 0.500977 1 0.346167 0.975481 0.500977 0.499023 0.346167 0.975481 0.20651 0.904322 0.500977 0.499023 0.20651 0.904322 0.0956782 0.79349 0.500977 0.499023 0.0956782 0.79349 0.0245196 0.653834 0.500977 0.499023 0.0245196 0.653834 0 0.499024 0.500977 0.499023 0 0.499024 0.0245195 0.344213 0.500977 0.499023 0.0245195 0.344213 0.0956781 0.204557 0.500977 0.499023 0.0956781 0.204557 0.20651 0.093725 0.500977 0.499023 0.20651 0.093725 0.346166 0.0225664 0.500977 0.499023 0.346166 0.0225664 0.500977 -0.00195312 0.500977 0.499023 0.500977 -0.00195312 0.655787 0.0225663 0.500977 0.499023 0.655787 0.0225663 0.795443 0.093725 0.500977 0.499023 0.795443 0.093725 0.906275 0.204557 0.500977 0.499023 0.906275 0.204557 0.977434 0.344213
                  ]
                }
                coordIndex [
                  20, 0, 19, -1, 20, 19, 18, -1, 20, 18, 17, -1, 20, 17, 16, -1, 20, 16, 15, -1, 20, 15, 14, -1, 20, 14, 13, -1, 20, 13, 12, -1, 20, 12, 11, -1, 20, 11, 10, -1, 20, 10, 9, -1, 20, 9, 8, -1, 20, 8, 7, -1, 20, 7, 6, -1, 20, 6, 5, -1, 20, 5, 4, -1, 20, 4, 3, -1, 20, 3, 2, -1, 20, 2, 1, -1, 20, 1, 0, -1
                ]
                texCoordIndex [
                  0, 1, 2, -1, 3, 4, 5, -1, 6, 7, 8, -1, 9, 10, 11, -1, 12, 13, 14, -1, 15, 16, 17, -1, 18, 19, 20, -1, 21, 22, 23, -1, 24, 25, 26, -1, 27, 28, 29, -1, 30, 31, 32, -1, 33, 34, 35, -1, 36, 37, 38, -1, 39, 40, 41, -1, 42, 43, 44, -1, 45, 46, 47, -1, 48, 49, 50, -1, 51, 52, 53, -1, 54, 55, 56, -1, 57, 58, 59, -1
                ]
                creaseAngle 0.785398
              }
            }
          ]
        }
        DEF EPUCK_BATTERY Transform {
          translation 0 0.007 0.026
          rotation 1 0 0 -1.5708053071795867
          children [
            Shape {
              appearance PBRAppearance {
                baseColor 0 0 0
                roughness 1
                metalness 0
              }
              geometry IndexedFaceSet {
                coord Coordinate {
                  point [
                    0.012914 0.050175 0.005215, 0.014813 0.050175 0.004421, 0.011886 0.050175 0.005317, 0.013902 0.050175 0.004912, -0.012933 0.050175 0.005215, -0.013922 0.050175 0.004912, -0.014833 0.050175 0.004421, -0.015631 0.050175 0.00376, -0.016287 0.050175 0.002954, -0.016774 0.050175 0.002035, -0.017074 0.050175 0.001037, -0.017175 0.050175 0, -0.017074 0.050175 -0.001037, -0.016774 0.050175 -0.002034, -0.016287 0.050175 -0.002954, -0.015631 0.050175 -0.003759, -0.014833 0.050175 -0.00442, -0.013922 0.050175 -0.004912, -0.012933 0.050175 -0.005214, -0.011905 0.050175 -0.005316, -0.011905 0.050175 0.005317, 0.012914 0.050175 -0.005214, 0.013902 0.050175 -0.004912, 0.014813 0.050175 -0.00442, 0.015612 0.050175 -0.003759, 0.016267 0.050175 -0.002954, 0.016754 0.050175 -0.002034, 0.017054 0.050175 -0.001037, 0.017155 0.050175 0, 0.017054 0.050175 0.001037, 0.016754 0.050175 0.002035, 0.016267 0.050175 0.002954, 0.015612 0.050175 0.00376, 0.012914 0.04381 0.005215, 0.014813 0.04381 0.004421, 0.011886 0.04381 0.005317, 0.013902 0.04381 0.004912, 0.012914 0.04381 -0.005214, 0.013902 0.04381 -0.004912, 0.014813 0.04381 -0.00442, 0.015612 0.04381 -0.003759, 0.016267 0.04381 -0.002954, 0.016754 0.04381 -0.002034, 0.017054 0.04381 -0.001037, 0.017155 0.04381 0, 0.017054 0.04381 0.001037, 0.016754 0.04381 0.002035, 0.016267 0.04381 0.002954, 0.015612 0.04381 0.00376, -0.012933 0.043756 0.005215, -0.013922 0.043756 0.004912, -0.014833 0.043756 0.004421, -0.015631 0.043756 0.00376, -0.016287 0.043756 0.002954, -0.016774 0.043756 0.002035, -0.017074 0.043756 0.001037, -0.017175 0.043756 0, -0.017074 0.043756 -0.001037, -0.016774 0.043756 -0.002034, -0.016287 0.043756 -0.002954, -0.015631 0.043756 -0.003759, -0.014833 0.043756 -0.00442, -0.013922 0.043756 -0.004912, -0.012933 0.043756 -0.005214, -0.011905 0.043756 -0.005316, -0.011905 0.043756 0.005317, 0.012106 0.050175 0.003134, 0.003471 0.050175 -0.003112, 0.003471 0.050175 0.003134, 0.012525 0.050175 -0.003052, -0.002733 0.050175 0.003134, -0.011822 0.050175 -0.003112, -0.011822 0.050175 0.003134, -0.002655 0.050175 -0.003052
                  ]
                }
                coordIndex [
                  37, 21, 22, -1, 22, 23, 39, -1, 40, 39, 23, -1, 41, 40, 24, -1, 42, 41, 25, -1, 43, 42, 26, -1, 44, 43, 27, -1, 45, 44, 28, -1, 46, 45, 29, -1, 47, 46, 30, -1, 48, 47, 31, -1, 34, 48, 32, -1, 36, 34, 1, -1, 33, 36, 3, -1, 35, 33, 0, -1, 65, 20, 4, -1, 50, 49, 4, -1, 51, 50, 5, -1, 52, 51, 6, -1, 53, 52, 7, -1, 54, 53, 8, -1, 55, 54, 9, -1, 56, 55, 10, -1, 57, 56, 11, -1, 58, 57, 12, -1, 59, 58, 13, -1, 60, 59, 14, -1, 61, 60, 15, -1, 62, 61, 16, -1, 63, 62, 17, -1, 64, 63, 18, -1, 30, 66, 31, -1, 11, 72, 71, -1, 68, 67, 73, -1, 68, 70, 2, -1, 73, 69, 21, -1, 56, 64, 65, -1, 64, 19, 20, -1, 47, 48, 35, -1, 35, 2, 21, -1, 19, 2, 20, -1, 38, 37, 22, -1, 39, 38, 22, -1, 22, 21, 23, -1, 24, 40, 23, -1, 25, 41, 24, -1, 26, 42, 25, -1, 27, 43, 26, -1, 28, 44, 27, -1, 29, 45, 28, -1, 30, 46, 29, -1, 31, 47, 30, -1, 32, 48, 31, -1, 1, 34, 32, -1, 3, 36, 1, -1, 0, 33, 3, -1, 2, 35, 0, -1, 49, 65, 4, -1, 5, 50, 4, -1, 6, 51, 5, -1, 7, 52, 6, -1, 8, 53, 7, -1, 9, 54, 8, -1, 10, 55, 9, -1, 11, 56, 10, -1, 12, 57, 11, -1, 13, 58, 12, -1, 14, 59, 13, -1, 15, 60, 14, -1, 16, 61, 15, -1, 17, 62, 16, -1, 18, 63, 17, -1, 19, 64, 18, -1, 32, 31, 66, -1, 30, 29, 66, -1, 28, 27, 69, -1, 26, 25, 69, -1, 24, 23, 69, -1, 22, 21, 69, -1, 66, 2, 3, -1, 22, 69, 23, -1, 25, 24, 69, -1, 29, 28, 66, -1, 1, 32, 66, -1, 0, 3, 2, -1, 69, 66, 28, -1, 27, 26, 69, -1, 3, 1, 66, -1, 4, 20, 5, -1, 72, 10, 9, -1, 19, 18, 17, -1, 17, 16, 71, -1, 15, 14, 71, -1, 13, 12, 71, -1, 11, 10, 72, -1, 9, 8, 72, -1, 7, 6, 72, -1, 5, 20, 72, -1, 71, 19, 17, -1, 16, 15, 71, -1, 12, 11, 71, -1, 8, 7, 72, -1, 5, 72, 6, -1, 14, 13, 71, -1, 70, 68, 73, -1, 20, 2, 70, -1, 66, 68, 2, -1, 70, 72, 20, -1, 21, 19, 73, -1, 71, 73, 19, -1, 64, 56, 57, -1, 49, 50, 65, -1, 51, 52, 65, -1, 53, 54, 65, -1, 55, 56, 65, -1, 57, 58, 64, -1, 59, 60, 64, -1, 61, 62, 64, -1, 63, 64, 62, -1, 50, 51, 65, -1, 54, 55, 65, -1, 58, 59, 64, -1, 61, 64, 60, -1, 52, 53, 65, -1, 65, 64, 20, -1, 35, 37, 44, -1, 38, 39, 37, -1, 40, 41, 37, -1, 42, 43, 37, -1, 44, 45, 35, -1, 46, 47, 35, -1, 48, 34, 35, -1, 36, 33, 35, -1, 37, 39, 40, -1, 41, 42, 37, -1, 45, 46, 35, -1, 34, 36, 35, -1, 37, 43, 44, -1, 37, 35, 21, -1, 21, 2, 19, -1
                ]
                creaseAngle 0.5
              }
            }
            Shape {
              appearance PBRAppearance {
              }
              geometry IndexedFaceSet {
                coord Coordinate {
                  point [
                    0.012168 0.04944 0.004577, 0.013958 0.04944 0.00388, 0.011199 0.04944 0.004666, 0.013099 0.04944 0.004311, -0.012188 0.04944 0.004577, -0.013119 0.04944 0.004311, -0.013977 0.04944 0.00388, -0.01473 0.04944 0.0033, -0.015347 0.04944 0.002593, -0.015806 0.04944 0.001786, -0.016089 0.04944 0.000911, -0.016184 0.04944 0, -0.016089 0.04944 -0.00091, -0.015806 0.04944 -0.001785, -0.015347 0.04944 -0.002592, -0.01473 0.04944 -0.003299, -0.013977 0.04944 -0.00388, -0.013119 0.04944 -0.004311, -0.012188 0.04944 -0.004576, -0.011219 0.04944 -0.004666, -0.011219 0.04944 0.004666, 0.012168 0.04944 -0.004576, 0.013099 0.04944 -0.004311, 0.013958 0.04944 -0.00388, 0.01471 0.04944 -0.003299, 0.015328 0.04944 -0.002592, 0.015787 0.04944 -0.001785, 0.016069 0.04944 -0.00091, 0.016165 0.04944 0, 0.016069 0.04944 0.000911, 0.015787 0.04944 0.001786, 0.015328 0.04944 0.002593, 0.01471 0.04944 0.0033, 0.008543 0 0.003561, 0.009282 0 0.003492, 0.009993 0 0.00329, 0.010648 0 0.002961, 0.011222 0 0.002518, 0.011693 0 0.001978, 0.012044 0 0.001363, 0.012259 0 0.000695, 0.012332 0 0, 0.012259 0 -0.000694, 0.012044 0 -0.001362, 0.011693 0 -0.001978, 0.011222 0 -0.002517, 0.010648 0 -0.00296, 0.009993 0 -0.003289, 0.009282 0 -0.003492, 0.008543 0 -0.00356, -0.008563 0 0.003561, -0.008563 0 -0.00356, -0.009302 0 -0.003492, -0.010013 0 -0.003289, -0.010668 0 -0.00296, -0.011242 0 -0.002517, -0.011713 0 -0.001978, -0.012063 0 -0.001362, -0.012279 0 -0.000694, -0.012352 0 0, -0.012279 0 0.000695, -0.012063 0 0.001363, -0.011713 0 0.001978, -0.011242 0 0.002518, -0.010668 0 0.002961, -0.010013 0 0.00329, -0.009302 0 0.003492, 0.008543 0 0.004674, 0.008543 0 -0.004673, -0.008563 0 0.004674, -0.008563 0 -0.004673, 0.008543 0.001605 0.004674, 0.008543 0.001605 -0.004673, -0.008563 0.001605 0.004674, -0.008563 0.001605 -0.004673
                  ]
                }
                coordIndex [
                  1, 17, 13, -1, 74, 72, 68, -1, 70, 68, 49, -1, 50, 33, 67, -1, 67, 71, 73, -1, 50, 49, 33, -1, 5, 4, 20, -1, 20, 2, 0, -1, 0, 3, 1, -1, 31, 30, 29, -1, 20, 0, 1, -1, 31, 29, 28, -1, 5, 20, 1, -1, 31, 28, 27, -1, 6, 5, 1, -1, 31, 27, 26, -1, 7, 6, 1, -1, 31, 26, 25, -1, 8, 7, 1, -1, 31, 25, 24, -1, 9, 8, 1, -1, 32, 31, 24, -1, 10, 9, 1, -1, 1, 32, 24, -1, 24, 23, 22, -1, 22, 21, 19, -1, 19, 18, 17, -1, 17, 16, 15, -1, 15, 14, 13, -1, 13, 12, 11, -1, 11, 10, 1, -1, 1, 24, 22, -1, 22, 19, 17, -1, 17, 15, 13, -1, 13, 11, 1, -1, 1, 22, 17, -1, 70, 74, 68, -1, 51, 70, 49, -1, 69, 50, 67, -1, 69, 67, 73, -1, 66, 65, 64, -1, 37, 36, 35, -1, 66, 64, 63, -1, 38, 37, 35, -1, 66, 63, 62, -1, 39, 38, 35, -1, 66, 62, 61, -1, 40, 39, 35, -1, 66, 61, 60, -1, 41, 40, 35, -1, 66, 60, 59, -1, 42, 41, 35, -1, 66, 59, 58, -1, 43, 42, 35, -1, 66, 58, 57, -1, 44, 43, 35, -1, 66, 57, 56, -1, 45, 44, 35, -1, 66, 56, 55, -1, 46, 45, 35, -1, 66, 55, 54, -1, 47, 46, 35, -1, 66, 54, 53, -1, 47, 35, 34, -1, 66, 53, 52, -1, 47, 34, 33, -1, 66, 52, 51, -1, 48, 47, 33, -1, 50, 66, 51, -1, 49, 48, 33, -1, 50, 51, 49, -1
                ]
              }
            }
            Shape {
              appearance PBRAppearance {
                baseColor 0.12549 0.290196 0.529412
                metalness 0
              }
              geometry IndexedFaceSet {
                coord Coordinate {
                  point [
                    0.012168 0.04944 0.004577, 0.013958 0.04944 0.00388, 0.011199 0.04944 0.004666, 0.013099 0.04944 0.004311, 0.011199 0 0.004666, 0.012168 0 0.004577, 0.013099 0 0.004311, 0.013958 0 0.00388, 0.01471 0 0.0033, 0.015328 0 0.002593, 0.015787 0 0.001786, 0.016069 0 0.000911, 0.016165 0 0, 0.016069 0 -0.00091, 0.015787 0 -0.001785, 0.015328 0 -0.002592, 0.01471 0 -0.003299, 0.013958 0 -0.00388, 0.013099 0 -0.004311, 0.012168 0 -0.004576, 0.011199 0 -0.004666, -0.012188 0.04944 0.004577, -0.013119 0.04944 0.004311, -0.013977 0.04944 0.00388, -0.01473 0.04944 0.0033, -0.015347 0.04944 0.002593, -0.015806 0.04944 0.001786, -0.016089 0.04944 0.000911, -0.016184 0.04944 0, -0.016089 0.04944 -0.00091, -0.015806 0.04944 -0.001785, -0.015347 0.04944 -0.002592, -0.01473 0.04944 -0.003299, -0.013977 0.04944 -0.00388, -0.013119 0.04944 -0.004311, -0.012188 0.04944 -0.004576, -0.011219 0 0.004666, -0.011219 0.04944 -0.004666, -0.011219 0.04944 0.004666, 0.012168 0.04944 -0.004576, 0.013099 0.04944 -0.004311, 0.013958 0.04944 -0.00388, 0.01471 0.04944 -0.003299, 0.015328 0.04944 -0.002592, 0.015787 0.04944 -0.001785, 0.016069 0.04944 -0.00091, 0.016165 0.04944 0, 0.016069 0.04944 0.000911, 0.015787 0.04944 0.001786, 0.015328 0.04944 0.002593, 0.01471 0.04944 0.0033, -0.011219 0 -0.004666, -0.012188 0 -0.004576, -0.013119 0 -0.004311, -0.013977 0 -0.00388, -0.01473 0 -0.003299, -0.015347 0 -0.002592, -0.015806 0 -0.001785, -0.016089 0 -0.00091, -0.016184 0 0, -0.016089 0 0.000911, -0.015806 0 0.001786, -0.015347 0 0.002593, -0.01473 0 0.0033, -0.013977 0 0.00388, -0.013119 0 0.004311, -0.012188 0 0.004577, 0.008543 0 0.003561, 0.009282 0 0.003492, 0.009993 0 0.00329, 0.010648 0 0.002961, 0.011222 0 0.002518, 0.011693 0 0.001978, 0.012044 0 0.001363, 0.012259 0 0.000695, 0.012332 0 0, 0.012259 0 -0.000694, 0.012044 0 -0.001362, 0.011693 0 -0.001978, 0.011222 0 -0.002517, 0.010648 0 -0.00296, 0.009993 0 -0.003289, 0.009282 0 -0.003492, 0.008543 0 -0.00356, -0.008563 0 0.003561, -0.008563 0 -0.00356, -0.009302 0 -0.003492, -0.010013 0 -0.003289, -0.010668 0 -0.00296, -0.011242 0 -0.002517, -0.011713 0 -0.001978, -0.012063 0 -0.001362, -0.012279 0 -0.000694, -0.012352 0 0, -0.012279 0 0.000695, -0.012063 0 0.001363, -0.011713 0 0.001978, -0.011242 0 0.002518, -0.010668 0 0.002961, -0.010013 0 0.00329, -0.009302 0 0.003492, 0.008543 0 0.004674, 0.008543 0 -0.004673, -0.008563 0 0.004674, -0.008563 0 -0.004673, 0.008543 0.001605 0.004674, 0.008543 0.001605 -0.004673, -0.008563 0.001605 0.004674, -0.008563 0.001605 -0.004673
                  ]
                }
                coordIndex [
                  3, 0, 5, -1, 28, 29, 58, -1, 20, 106, 39, -1, 1, 3, 6, -1, 27, 28, 59, -1, 50, 1, 7, -1, 26, 27, 60, -1, 49, 50, 8, -1, 25, 26, 61, -1, 48, 49, 9, -1, 24, 25, 62, -1, 47, 48, 10, -1, 23, 24, 63, -1, 46, 47, 11, -1, 22, 23, 64, -1, 35, 37, 51, -1, 45, 46, 12, -1, 21, 22, 65, -1, 34, 35, 52, -1, 44, 45, 13, -1, 38, 21, 66, -1, 33, 34, 53, -1, 43, 44, 14, -1, 32, 33, 54, -1, 42, 43, 15, -1, 31, 32, 55, -1, 41, 42, 16, -1, 30, 31, 56, -1, 40, 41, 17, -1, 0, 2, 4, -1, 29, 30, 57, -1, 39, 40, 18, -1, 104, 51, 108, -1, 51, 37, 108, -1, 102, 106, 20, -1, 37, 39, 106, -1, 101, 4, 105, -1, 107, 36, 103, -1, 36, 107, 38, -1, 4, 2, 105, -1, 2, 38, 107, -1, 36, 100, 103, -1, 66, 100, 36, -1, 65, 100, 66, -1, 53, 86, 87, -1, 67, 68, 101, -1, 54, 87, 88, -1, 100, 65, 99, -1, 86, 53, 52, -1, 100, 84, 103, -1, 98, 63, 97, -1, 61, 96, 62, -1, 54, 53, 87, -1, 61, 95, 96, -1, 60, 95, 61, -1, 60, 94, 95, -1, 59, 94, 60, -1, 59, 93, 94, -1, 58, 92, 59, -1, 86, 52, 51, -1, 58, 91, 92, -1, 57, 91, 58, -1, 57, 90, 91, -1, 56, 90, 57, -1, 56, 89, 90, -1, 56, 55, 89, -1, 63, 62, 97, -1, 55, 54, 88, -1, 86, 51, 104, -1, 55, 88, 89, -1, 64, 63, 98, -1, 92, 93, 59, -1, 96, 97, 62, -1, 65, 64, 99, -1, 85, 86, 104, -1, 99, 64, 98, -1, 6, 68, 69, -1, 68, 5, 4, -1, 8, 70, 71, -1, 7, 6, 69, -1, 82, 83, 102, -1, 8, 7, 70, -1, 18, 17, 81, -1, 9, 8, 71, -1, 71, 72, 9, -1, 7, 69, 70, -1, 10, 72, 73, -1, 11, 10, 73, -1, 11, 73, 74, -1, 12, 11, 74, -1, 12, 74, 75, -1, 12, 75, 76, -1, 13, 12, 76, -1, 13, 76, 77, -1, 14, 13, 77, -1, 14, 77, 78, -1, 15, 14, 78, -1, 15, 78, 79, -1, 80, 16, 79, -1, 68, 6, 5, -1, 81, 17, 80, -1, 82, 18, 81, -1, 17, 16, 80, -1, 68, 4, 101, -1, 20, 82, 102, -1, 72, 10, 9, -1, 18, 82, 19, -1, 19, 82, 20, -1, 16, 15, 79, -1, 6, 3, 5, -1, 59, 28, 58, -1, 19, 20, 39, -1, 7, 1, 6, -1, 60, 27, 59, -1, 8, 50, 7, -1, 61, 26, 60, -1, 9, 49, 8, -1, 62, 25, 61, -1, 10, 48, 9, -1, 63, 24, 62, -1, 11, 47, 10, -1, 64, 23, 63, -1, 12, 46, 11, -1, 65, 22, 64, -1, 52, 35, 51, -1, 13, 45, 12, -1, 66, 21, 65, -1, 53, 34, 52, -1, 14, 44, 13, -1, 36, 38, 66, -1, 54, 33, 53, -1, 15, 43, 14, -1, 55, 32, 54, -1, 16, 42, 15, -1, 56, 31, 55, -1, 17, 41, 16, -1, 57, 30, 56, -1, 18, 40, 17, -1, 5, 0, 4, -1, 58, 29, 57, -1, 19, 39, 18, -1, 108, 37, 106, -1, 105, 2, 107, -1
                ]
                creaseAngle 1
              }
            }
          ]
        }
        %{ if v1 then }%
          DEF EPUCK_TURRET Transform {
            translation 0 0.0466 0.004
            scale 0.0128 0.0128 0.0128
            children [
              Shape {
              appearance PBRAppearance {
                baseColorMap ImageTexture {
                  url [
                    "textures/e-puck1_turret_base_color.jpg"
                  ]
                }
                roughnessMap ImageTexture {
                  url [
                    "textures/e-puck1_turret_roughness.jpg"
                  ]
                }
                metalnessMap ImageTexture {
                  url [
                    "textures/e-puck1_turret_metalness.jpg"
                  ]
                }
                normalMap ImageTexture {
                  url [
                    "textures/e-puck1_turret_normal.jpg"
                  ]
                }
                occlusionMap ImageTexture {
                  url [
                    "textures/e-puck1_turret_occlusion.jpg"
                  ]
                }
              }
                geometry IndexedFaceSet {
                  coord Coordinate {
                    point [ 0.419895 0.151244 2.421000 0.948889 0.151244 2.256830 1.435320 0.151244 1.971050 1.228590 0.151244 -0.710407 1.100900 0.151244 -1.014430 0.954969 0.151244 -1.184670 0.577985 0.151244 -1.482610 0.213162 0.151244 -1.640700 1.301550 0.151244 -2.376430 1.380600 0.151244 -2.467640 1.496130 0.151244 -2.516280 1.617740 0.151244 -2.498040 1.690700 0.151244 -2.418990 1.727180 0.151244 -2.309550 1.629900 0.151244 -2.078490 1.490050 0.151244 -2.048090 1.283310 0.151244 -2.266980 -0.419901 0.151244 2.421000 -1.100900 0.151244 -1.014430 -0.419901 0.151244 -1.579900 -0.213167 0.151244 -1.640690 -1.301550 0.151244 -2.376430 -1.380600 0.151244 -2.467640 -1.617740 0.151244 -2.498040 -1.690700 0.151244 -2.418990 -1.727180 0.151244 -2.309550 -1.629900 0.151244 -2.078490 -0.577991 0.151244 -1.482610 -0.954975 0.151244 -1.184670 -1.283310 0.151244 -2.266980 -1.490050 0.151244 -2.048090 -1.715020 0.151244 -2.181860 -1.496130 0.151244 -2.516280 -0.000003 0.151244 2.463560 -0.000003 0.151244 -1.652860 1.715020 0.151244 -2.181860 -1.435310 0.151244 1.971050 -0.948890 0.151244 2.256830 -1.228580 0.151244 -0.710411 0.419894 0.151244 -1.579900 ]
                  }
                  texCoord TextureCoordinate {
                    point [ 0.4979 0.0000 0.5862 0.0085 0.4097 0.0085 0.4097 0.0085 0.5862 0.0085 0.2986 0.0415 0.5862 0.0085 0.6973 0.0415 0.2986 0.0415 0.2986 0.0415 0.6973 0.0415 0.1964 0.0989 0.6973 0.0415 0.7995 0.0989 0.1964 0.0989 0.7995 0.0989 0.2398 0.6374 0.1964 0.0989 0.7995 0.0989 0.7561 0.6374 0.2398 0.6374 0.7561 0.6374 0.2666 0.6984 0.2398 0.6374 0.7561 0.6374 0.7293 0.6984 0.2666 0.6984 0.7293 0.6984 0.2973 0.7326 0.2666 0.6984 0.7293 0.6984 0.6986 0.7326 0.2973 0.7326 0.6986 0.7326 0.3765 0.7924 0.2973 0.7326 0.6986 0.7326 0.6194 0.7924 0.3765 0.7924 0.6194 0.7924 0.4097 0.8120 0.3765 0.7924 0.6194 0.7924 0.5862 0.8120 0.4097 0.8120 0.5427 0.8242 0.4979 0.8266 0.4532 0.8242 0.5862 0.8120 0.4532 0.8242 0.4097 0.8120 0.6194 0.7924 0.8110 0.9060 0.7676 0.9499 0.8609 0.9585 0.7880 0.9902 0.7676 0.9499 0.1350 0.9585 0.1849 0.9060 0.2283 0.9499 0.1849 0.9060 0.3765 0.7924 0.2283 0.9499 0.5427 0.8242 0.4532 0.8242 0.5862 0.8120 0.6194 0.7924 0.6986 0.7326 0.8110 0.9060 0.7714 0.9719 0.7676 0.9499 0.7880 0.9902 0.8110 0.9060 0.8404 0.9121 0.8583 0.9328 0.8583 0.9328 0.8609 0.9585 0.8110 0.9060 0.8532 0.9805 0.8379 0.9963 0.8123 1.0000 0.8123 1.0000 0.7880 0.9902 0.8532 0.9805 0.7676 0.9499 0.8110 0.9060 0.8609 0.9585 0.8609 0.9585 0.8532 0.9805 0.7880 0.9902 0.2283 0.9499 0.2245 0.9719 0.2079 0.9902 0.2079 0.9902 0.1836 1.0000 0.1427 0.9805 0.1580 0.9963 0.1427 0.9805 0.1836 1.0000 0.1350 0.9585 0.1376 0.9328 0.1849 0.9060 0.1555 0.9121 0.1849 0.9060 0.1376 0.9328 0.2283 0.9499 0.2079 0.9902 0.1350 0.9585 0.1427 0.9805 0.1350 0.9585 0.2079 0.9902 0.1849 0.9060 0.2973 0.7326 0.3765 0.7924 ]
                  }
                  texCoordIndex [ 0 1 2 -1 3 4 5 -1 6 7 8 -1 9 10 11 -1 12 13 14 -1 15 16 17 -1 18 19 20 -1 21 22 23 -1 24 25 26 -1 27 28 29 -1 30 31 32 -1 33 34 35 -1 36 37 38 -1 39 40 41 -1 42 43 44 -1 45 46 47 -1 48 49 50 -1 51 52 53 -1 54 55 56 -1 57 58 59 -1 60 61 62 -1 63 64 65 -1 66 67 68 -1 69 70 71 -1 72 73 74 -1 75 76 77 -1 78 79 80 -1 81 82 83 -1 84 85 86 -1 87 88 89 -1 90 91 92 -1 93 94 95 -1 96 97 98 -1 99 100 101 -1 102 103 104 -1 105 106 107 -1 108 109 110 -1 111 112 113 -1 ]
                  coordIndex [ 33 0 17 -1 17 0 37 -1 0 1 37 -1 37 1 36 -1 1 2 36 -1 2 38 36 -1 2 3 38 -1 3 18 38 -1 3 4 18 -1 4 28 18 -1 4 5 28 -1 5 27 28 -1 5 6 27 -1 6 19 27 -1 6 39 19 -1 7 34 20 -1 39 20 19 -1 6 15 16 -1 13 9 16 -1 25 30 29 -1 30 27 29 -1 7 20 39 -1 6 5 15 -1 8 16 9 -1 15 14 35 -1 35 13 15 -1 12 11 10 -1 10 9 12 -1 16 15 13 -1 13 12 9 -1 29 21 22 -1 22 32 24 -1 23 24 32 -1 25 31 30 -1 26 30 31 -1 29 22 25 -1 24 25 22 -1 30 28 27 -1 ]
                  creaseAngle 0.785398
                }
              }
              Shape {
                appearance USE EPUCK_SIDE_PRINT_APPEARANCE
                geometry IndexedFaceSet {
                  coord Coordinate {
                    point [
                      0.419895 0.151244 2.421 0.948889 0.151244 2.25683 1.43532 0.151244 1.97105 1.22859 0.151244 -0.710407 1.1009 0.151244 -1.01443 0.954969 0.151244 -1.18467 0.603673 0.151244 -1.46549 0.419895 0.151244 -1.56421 0.213162 0.151244 -1.62501 1.30155 0.151244 -2.37643 1.3806 0.151244 -2.46764 1.49613 0.151244 -2.51628 1.61774 0.151244 -2.49804 1.6907 0.151244 -2.41899 1.72718 0.151244 -2.30955 1.6299 0.151244 -2.07849 1.49005 0.151244 -2.04809 1.2914 0.151244 -2.2132 -0.419901 0.151244 2.421 -1.1009 0.151244 -1.01443 -0.419901 0.151244 -1.56421 -0.213167 0.151244 -1.625 -1.30155 0.151244 -2.37643 -1.3806 0.151244 -2.46764 -1.61774 0.151244 -2.49804 -1.6907 0.151244 -2.41899 -1.72718 0.151244 -2.30955 -1.6299 0.151244 -2.07849 -0.624158 0.151244 -1.44904 -0.954975 0.151244 -1.18467 -0.419901 0.0012444 2.421 -1.1009 0.0012443 -1.01443 -0.954975 0.0012443 -1.18467 -0.624158 0.0012443 -1.44904 -0.419901 0.0012443 -1.56421 -1.6299 0.0012442 -2.07849 -1.72718 0.0012442 -2.30955 -1.6907 0.0012442 -2.41899 -1.61774 0.0012442 -2.49804 1.2914 0.0012442 -2.2132 1.30155 0.0012442 -2.37643 1.3806 0.0012442 -2.46764 1.49613 0.0012442 -2.51628 1.61774 0.0012442 -2.49804 1.6907 0.0012442 -2.41899 1.72718 0.0012442 -2.30955 1.6299 0.0012442 -2.07849 1.49005 0.0012442 -2.04809 0.603723 0.0012943 -1.46554 0.954969 0.0012443 -1.18467 1.1009 0.0012443 -1.01443 1.22859 0.0012443 -0.710407 1.43532 0.0012444 1.97105 0.948889 0.0012444 2.25683 0.419895 0.0012444 2.421 -1.28751 0.0012442 -2.21662 -1.49005 0.0012442 -2.04809 -1.30155 0.0012442 -2.37643 -1.71502 0.0012442 -2.18186 -1.49613 0.0012442 -2.51628 -1.3806 0.0012442 -2.46764 3.054e-05 0.0012778 2.46353 3.05623e-05 0.0012776 -1.6372 1.71502 0.0012442 -2.18186 -1.28751 0.151244 -2.21662 -1.49005 0.151244 -2.04809 -1.71502 0.151244 -2.18186 -1.49613 0.151244 -2.51628 -2.83867e-06 0.151244 2.46356 -2.84612e-06 0.151244 -1.63717 1.71502 0.151244 -2.18186 -1.43531 0.151244 1.97105 -0.94889 0.0012444 2.25683 -0.94889 0.151244 2.25683 -1.22858 0.151244 -0.710411 -1.22858 0.0012443 -0.710411 -1.43526 0.0012794 1.97099 -0.213167 0.0012443 -1.625 0.213158 0.0012443 -1.625 0.419945 0.0012943 -1.56426 0.419894 0.151244 -1.56421 0.213154 0.151244 -1.625
                    ]
                  }
                  coordIndex [
                    77, 78, 79, -1, 81, 80, 79, 78, -1, 52, 53, 76, -1, 53, 72, 76, -1, 53, 54, 72, -1, 54, 30, 72, -1, 75, 76, 71, -1, 74, 75, 71, -1, 22, 64, 55, 57, -1, 23, 22, 57, 60, -1, 23, 60, 59, 67, -1, 34, 20, 21, 77, -1, 33, 28, 20, 34, -1, 31, 19, 29, 32, -1, 75, 74, 19, 31, -1, 30, 18, 73, 72, -1, 61, 68, 18, 30, -1, 54, 0, 68, 61, -1, 53, 1, 0, 54, -1, 52, 2, 1, 53, -1, 51, 3, 2, 52, -1, 50, 4, 3, 51, -1, 49, 5, 4, 50, -1, 79, 7, 6, 48, -1, 62, 69, 8, 78, -1, 77, 21, 69, 62, -1, 47, 16, 5, 49, -1, 48, 6, 17, 39, -1, 46, 15, 16, 47, -1, 63, 70, 15, 46, -1, 45, 14, 70, 63, -1, 44, 13, 14, 45, -1, 43, 12, 13, 44, -1, 42, 11, 12, 43, -1, 41, 10, 11, 42, -1, 40, 9, 10, 41, -1, 39, 17, 9, 40, -1, 38, 24, 67, 59, -1, 37, 25, 24, 38, -1, 36, 26, 25, 37, -1, 58, 66, 26, 36, -1, 35, 27, 66, 58, -1, 56, 65, 27, 35, -1, 32, 29, 65, 56, -1, 55, 64, 28, 33, -1, 39, 47, 49, 48, -1, 40, 41, 42, 43, 44, 45, 63, 46, 47, 39, -1, 55, 56, 35, 58, 36, 37, 38, 59, 60, 57, -1, 33, 32, 56, 55, -1, 51, 52, 75, -1, 75, 52, 76, -1, 54, 61, 30, -1, 62, 78, 77, -1, 77, 78, 79, -1, 77, 79, 34, -1, 79, 48, 34, -1, 34, 48, 33, -1, 48, 49, 33, -1, 33, 49, 32, -1, 49, 50, 32, -1, 32, 50, 31, -1, 50, 51, 31, -1, 31, 51, 75, -1, 76, 72, 73, 71, -1
                  ]
                  creaseAngle 0.785398
                }
              }
            ]
          }
        %{ end }%
        DEF EPUCK_RIGHT_COLUMN Transform {
          translation 0.0193 0.0426 -0.0254
          children [
            DEF EPUCK_COLUMN Shape {
              appearance PBRAppearance {
                roughness 0.2
              }
              geometry Cylinder {
                height 0.014
                radius 0.00225
              }
            }
          ]
        }
        DEF EPUCK_LEFT_COLUMN Transform {
          translation -0.0193 0.0426 -0.0254
          children [
            USE EPUCK_COLUMN
          ]
        }
        DEF EPUCK_REAR_COLUMN Transform {
          translation 0 0.0426 0.032
          children [
            USE EPUCK_COLUMN
          ]
        }
          DEF EPUCK_RIGHT_CONNECTOR Transform {
            translation 0.0033 0.0426 0.0033
            children [
              DEF EPUCK_CONNECTOR Shape {
                appearance PBRAppearance {
                  baseColor 0 0 0
                  roughness 0.4
                  metalness 0
                }
                geometry Box {
                  size 0.005 0.008 0.02
                }
              }
            ]
          }
          DEF EPUCK_LEFT_CONNECTOR Transform {
            translation -0.012 0.0426 0.0024
            children [
              DEF EPUCK_CONNECTOR Shape {
                appearance PBRAppearance {
                  baseColor 0 0 0
                  roughness 0.4
                  metalness 0
                }
                geometry Box {
                  size 0.005 0.008 0.02
                }
              }
            ]
          }
          DEF EPUCK_BODY_LED LED {
            rotation 0 1 0 4.712399693899575
            children [
              Shape {
                appearance PBRAppearance {
                  baseColor 0.5 0.5 0.5
                  transparency 0.4
                  roughness 0.5
                  metalness 0
                  emissiveIntensity 0.2
                }
                geometry IndexedFaceSet {
                  coord Coordinate {
                    point [
                      0 0 0, 0.031522 0.025 0.015211, 0.031522 0.009 0.015211, 0.020982 0.00775 0.022017, 0.033472 0.006 0.009667, 0.029252 0.009825 0.018942, 0.016991 0.00101 0.022014, -0.022019 0.037 0.021983, -0.022018 0.025 0.021982, 0.02707 0.001064 0.00781, 0.027116 0.037 0.00781, -0.034656 0.031 0.003517, 0.026971 0.025 0.022022, 0.02707 0.01 0.022022, -0.027018 0.001 0.021978, -0.034312 0.031 0.005972, -0.034677 0.02633 0.003018, 0.035 0.037 2.9e-05, -0.031546 0.001 0.015161, -0.027018 0.037 0.021981, -0.027018 0.025 0.02198, -0.034312 0.025 0.005972, -0.034312 0.001 0.005972, -0.035 0.001 -2.7e-05, -0.035 0.025 -2.7e-05, -0.031312 0.025 0.005974, -0.031312 0.031 0.005974, -0.031656 0.031 0.00352, -0.032002 0.02633 0.003, -0.026442 0.025 -2.4e-05, -0.031546 0.037 0.015161, -0.031546 0.025 0.015161, 0.034116 0.001 0.007816, 0.034116 0.037 0.007816, 0.034116 0.025 0.007816, 0.035 0.001 2.9e-05, 0.034129 0.025 -0.007759, 0.034129 0.037 -0.007759, 0.034129 0.001 -0.007759, -0.031522 0.025 -0.015209, -0.031522 0.037 -0.015209, -0.031998 0.02633 -0.003049, -0.031651 0.031 -0.003568, -0.031302 0.031 -0.006022, -0.031302 0.025 -0.006022, -0.034302 0.001 -0.006024, -0.034302 0.025 -0.006024, -0.021982 0.025 -0.022015, -0.026983 0.025 -0.022021, -0.031522 0.001 -0.015209, -0.026983 0.001 -0.022019, -0.034672 0.02633 -0.003071, -0.034302 0.031 -0.006024, -0.026983 0.037 -0.022022, 0.031546 0.025 -0.015158, 0.031546 0.009 -0.015158, 0.027018 0.01 -0.021976, 0.026971 0.025 -0.021976, -0.034651 0.031 -0.00357, 0.027129 0.037 -0.007764, 0.02707 0.001064 -0.007764, -0.021983 0.037 -0.022015, 0.017026 0.00101 -0.021984, 0.029282 0.009825 -0.018893, 0.033487 0.006 -0.009611, 0.021018 0.00775 -0.021981, -0.022012 0.001029 0.021984, -0.021988 0.001029 -0.022017, -0.022012 0.002114 0.020705, -0.021988 0.002114 -0.020739, 0.020982 0.007866 0.021216, 0.02707 0.006116 0.009667, 0.02707 0.009941 0.018942, 0.016991 0.001125 0.021213, 0.02707 0.010116 0.021221, 0.02707 0.009116 0.015211, -0.026411 0.037 -0.020914, 0.02707 0.010116 -0.021175, 0.017026 0.001125 -0.021183, 0.02707 0.009941 -0.018893, 0.02707 0.006116 -0.009611, 0.021018 0.007866 -0.02118, 0.02707 0.009116 -0.015158, 0.026971 0.025 0.02126, 0.026971 0.025 0.015211, 0.027032 0.024944 0.007813, 0.027035 0.024936 -0.007761, 0.026971 0.025 -0.021174, 0.026971 0.025 -0.015158, -0.022018 0.025 0.020881, -0.022019 0.037 0.020881, -0.021982 0.025 -0.020913, -0.021983 0.037 -0.020914, -0.022012 0.001029 0.020691, -0.021988 0.001029 -0.020724, -0.030453 0.025 0.014633, -0.030453 0.03692 0.014633, -0.030444 0.03692 -0.01468, -0.030444 0.025 -0.01468, -0.026555 0.037 0.02095, -0.026555 0.02482 0.02095, -0.026442 0.001685 0.014633, -0.026555 0.001504 0.02095, -0.026411 0.025004 -0.020914, -0.026442 0.001774 -0.01468, -0.026411 0.001778 -0.020914, -0.028504 0.03696 0.017791, -0.029479 0.03694 0.016212, -0.028427 0.03696 -0.017797, -0.026442 0.036868 -0.01468, -0.029436 0.03694 -0.016239, -0.026442 0.036868 0.014633, -0.026442 0.025 0.014633, -0.026442 0.025 -0.01468, -0.026426 0.036934 -0.017797, -0.026498 0.036934 0.017791, 0.030629 0.037 -0.007761, 0.027122 0.037 2.3e-05, 0.031064 0.037 -0.003868
                    ]
                  }
                  coordIndex [
                    36, 38, 64, -1, 29, 41, 24, -1, 51, 24, 41, -1, 51, 41, 58, -1, 42, 58, 41, -1, 51, 58, 46, -1, 52, 46, 58, -1, 44, 46, 43, -1, 52, 43, 46, -1, 49, 40, 50, -1, 53, 50, 40, -1, 54, 55, 57, -1, 63, 57, 55, -1, 56, 57, 63, -1, 17, 35, 37, -1, 65, 62, 48, -1, 56, 65, 48, -1, 38, 37, 36, -1, 57, 56, 48, -1, 49, 45, 46, -1, 45, 23, 24, -1, 42, 43, 52, -1, 51, 46, 24, -1, 35, 38, 36, -1, 35, 36, 37, -1, 33, 34, 35, -1, 34, 32, 35, -1, 24, 21, 16, -1, 15, 26, 27, -1, 23, 22, 21, -1, 22, 18, 31, -1, 20, 13, 12, -1, 34, 33, 10, -1, 37, 36, 116, -1, 20, 3, 13, -1, 20, 6, 3, -1, 6, 20, 14, -1, 33, 35, 17, -1, 5, 12, 13, -1, 21, 26, 15, -1, 26, 21, 25, -1, 11, 21, 15, -1, 21, 11, 16, -1, 28, 11, 27, -1, 11, 28, 16, -1, 28, 24, 16, -1, 24, 28, 29, -1, 4, 32, 34, -1, 1, 2, 4, -1, 1, 4, 34, -1, 28, 26, 25, -1, 42, 41, 43, -1, 69, 68, 66, -1, 63, 79, 77, -1, 56, 77, 81, -1, 78, 62, 65, -1, 74, 72, 5, -1, 13, 3, 70, -1, 73, 70, 3, -1, 81, 77, 87, -1, 81, 87, 78, -1, 74, 70, 83, -1, 73, 83, 70, -1, 87, 91, 78, -1, 83, 73, 89, -1, 73, 93, 89, -1, 66, 93, 73, -1, 67, 62, 78, -1, 78, 91, 94, -1, 60, 35, 9, -1, 9, 32, 4, -1, 72, 83, 84, -1, 75, 84, 85, -1, 71, 85, 9, -1, 36, 64, 54, -1, 64, 55, 54, -1, 47, 48, 61, -1, 53, 61, 48, -1, 50, 48, 62, -1, 2, 12, 5, -1, 12, 2, 1, -1, 20, 7, 19, -1, 7, 20, 8, -1, 30, 14, 19, -1, 14, 30, 18, -1, 22, 45, 14, -1, 67, 66, 49, -1, 1, 84, 83, -1, 85, 84, 1, -1, 54, 88, 86, -1, 87, 88, 54, -1, 64, 38, 60, -1, 55, 64, 80, -1, 82, 79, 63, -1, 2, 75, 71, -1, 5, 72, 75, -1, 82, 88, 79, -1, 92, 91, 47, -1, 87, 57, 47, -1, 7, 8, 89, -1, 83, 89, 8, -1, 96, 31, 30, -1, 97, 40, 39, -1, 98, 39, 46, -1, 95, 25, 21, -1, 76, 53, 40, -1, 61, 53, 76, -1, 99, 19, 7, -1, 107, 96, 30, -1, 99, 90, 89, -1, 113, 98, 44, -1, 105, 103, 113, -1, 102, 100, 89, -1, 103, 91, 92, -1, 98, 113, 109, -1, 91, 103, 105, -1, 113, 29, 104, -1, 101, 112, 100, -1, 29, 101, 104, -1, 118, 59, 117, -1, 39, 49, 46, -1, 46, 45, 24, -1, 58, 42, 52, -1, 11, 15, 27, -1, 24, 23, 21, -1, 21, 22, 31, -1, 28, 27, 26, -1, 25, 29, 28, -1, 44, 43, 41, -1, 41, 29, 44, -1, 69, 104, 101, -1, 67, 69, 66, -1, 56, 63, 77, -1, 65, 56, 81, -1, 81, 78, 65, -1, 13, 74, 5, -1, 74, 13, 70, -1, 6, 73, 3, -1, 6, 66, 73, -1, 94, 67, 78, -1, 32, 9, 35, -1, 60, 38, 35, -1, 71, 9, 4, -1, 84, 75, 72, -1, 72, 74, 83, -1, 71, 75, 85, -1, 49, 14, 45, -1, 18, 22, 14, -1, 23, 45, 22, -1, 14, 49, 66, -1, 50, 67, 49, -1, 12, 1, 83, -1, 34, 85, 1, -1, 36, 54, 86, -1, 57, 87, 54, -1, 80, 64, 60, -1, 82, 55, 80, -1, 55, 82, 63, -1, 4, 2, 71, -1, 2, 5, 75, -1, 80, 60, 86, -1, 87, 77, 79, -1, 82, 80, 86, -1, 87, 79, 88, -1, 86, 88, 82, -1, 61, 92, 47, -1, 91, 87, 47, -1, 90, 7, 89, -1, 12, 83, 8, -1, 95, 31, 96, -1, 98, 97, 39, -1, 44, 98, 46, -1, 31, 95, 21, -1, 108, 76, 40, -1, 92, 61, 76, -1, 90, 99, 7, -1, 19, 99, 30, -1, 100, 99, 89, -1, 111, 107, 106, -1, 93, 102, 89, -1, 76, 103, 92, -1, 109, 114, 108, -1, 29, 112, 101, -1, 94, 91, 105, -1, 10, 33, 17, -1, 118, 116, 59, -1, 103, 114, 113, -1, 112, 115, 100, -1, 95, 96, 111, -1, 25, 95, 112, -1, 37, 116, 118, -1, 17, 118, 117, -1, 86, 60, 10, -1, 59, 86, 117, -1, 34, 10, 85, -1, 60, 9, 85, -1, 30, 99, 106, -1, 106, 107, 30, -1, 29, 113, 44, -1, 104, 105, 113, -1, 97, 98, 109, -1, 102, 101, 100, -1, 102, 68, 101, -1, 69, 105, 104, -1, 101, 68, 69, -1, 40, 97, 110, -1, 110, 108, 40, -1, 106, 99, 115, -1, 115, 111, 106, -1, 96, 107, 111, -1, 110, 97, 109, -1, 76, 108, 114, -1, 110, 109, 108, -1, 109, 113, 114, -1, 103, 76, 114, -1, 99, 100, 115, -1, 112, 111, 115, -1, 112, 95, 111, -1, 29, 25, 112, -1, 17, 37, 118, -1, 10, 17, 117, -1, 117, 86, 10, -1, 36, 86, 116, -1, 59, 116, 86, -1, 10, 60, 85, -1
                  ]
                  creaseAngle 0.5
                }
              }
            ]
            name "led8"
            color [
              0 1 0
            ]
          }
          DEF EPUCK_FRONT_LED LED {
            translation 0.0125 0.0285 -0.031
            children [
              Shape {
                appearance PBRAppearance { # Don't use USE/DEF here
                  metalness 0.5
                  baseColor 0.8 0.8 0.8
                  transparency 0.3
                  roughness 0.2
                }
                geometry Sphere {
                  radius 0.0025
                }
              }
            ]
            name "led9"
            color [
              1 0.3 0
            ]
          }
          DEF EPUCK_SMALL_LOGO Transform {
            translation 0 0.031 0.035
            rotation 0 1 0 3.14159
            children [
              Shape {
                appearance PBRAppearance {
                  roughness 0.4
                  metalness 0
                  baseColorMap ImageTexture {
                    url [
                      "textures/gctronic_logo.png"
                    ]
                  }
                }
                geometry IndexedFaceSet {
                  coord Coordinate {
                    point [
                      0.005 -0.005 0 -0.005 -0.005 0 -0.005 0.005 0 0.005 0.005 0
                    ]
                  }
                  texCoord TextureCoordinate {
                    point [
                      0 0 1 0 1 1 0 1
                    ]
                  }
                  coordIndex [
                    0, 1, 2, 3
                  ]
                  texCoordIndex [
                    0, 1, 2, 3
                  ]
                }
              }
            ]
          }
          DEF EPUCK_RECEIVER Receiver {
            channel IS receiver_channel
          }
          DEF EPUCK_EMITTER Emitter {
            channel IS emitter_channel
          }
          

          
        `;
    
    var closeBracket = "\n\t\t}\n";
    
    for(let component in this.selectedDevices){
      let x = this.selectedDevices[component].x / 10000;
      let y = this.selectedDevices[component].y / 10000;
      let z = this.selectedDevices[component].z / 10000;
      y += 18.5/1000;
      console.log(this.selectedDevices[component]["name"])
      if(this.selectedDevices[component]["name"] == "Wheel"){
        proto_code += `
        HingeJoint {
          jointParameters HingeJointParameters {
            axis ${this.selectedDevices[component]["rz"]} ${this.selectedDevices[component]["ry"]} ${this.selectedDevices[component]["rx"]}
            anchor ${x} ${y} ${z}
          }
          device [
            RotationalMotor {
              name "${this.selectedDevices[component]["customName"]} motor"
              consumptionFactor -0.001 # small trick to encourage the movement (calibrated for the rat's life contest)
              maxVelocity IS max_velocity
            }
            PositionSensor {
              name "${this.selectedDevices[component]["customName"]} sensor"
              resolution 0.00628  # (2 * pi) / 1000
            }
          ]
          endPoint Solid {
            translation ${x} ${y} ${z}
            rotation 1 0 0 0
            children [
              DEF EPUCK_WHEEL Transform {
                rotation ${this.selectedDevices[component]["rx"]} ${this.selectedDevices[component]["ry"]} ${this.selectedDevices[component]["rz"]} ${this.selectedDevices[component]["a"]}
                children [
                  Shape {
                    appearance DEF EPUCK_TRANSPARENT_APPEARANCE PBRAppearance {
                      baseColor 0.5 0.5 0.5
                      transparency 0.4
                      roughness 0.5
                      metalness 0
                    }
                    geometry Cylinder {
                      height 0.003
                      radius 0.02
                      subdivision 24
                    }
                  }
                  Transform {
                    translation 0 0.0016 0
                    children [
                      Shape {
                        appearance PBRAppearance {
                          metalness 0
                          roughness 0.4
                          baseColorMap ImageTexture {
                            url [
                              "textures/gctronic_logo.png"
                            ]
                          }
                        }
                        geometry IndexedFaceSet {
                          coord Coordinate {
                            point [
                              -0.014 0 -0.014 -0.014 0 0.014 0.014 0 0.014 0.014 0 -0.014
                            ]
                          }
                          texCoord TextureCoordinate {
                            point [
                              0 0 1 0 1 1 0 1
                            ]
                          }
                          coordIndex [
                            0, 1, 2, 3
                          ]
                          texCoordIndex [
                            0, 1, 2, 3
                          ]
                        }
                      }
                    ]
                  }
                  Shape {
                    appearance PBRAppearance {
                      metalness 0
                      roughness 0.4
                      %{ if v1 then }%
                      baseColor 0.117647 0.815686 0.65098
                      %{ else }%
                      baseColor 0 0 0
                      %{ end }%
                    }
                    geometry Cylinder {
                      height 0.0015
                      radius 0.0201
                      subdivision 24
                      top FALSE
                      bottom FALSE
                    }
                  }
                  Transform {
                    translation 0 0.0035 0
                    children [
                      Shape {
                        appearance USE EPUCK_TRANSPARENT_APPEARANCE
                        geometry Cylinder {
                          height 0.004
                          radius 0.005
                        }
                      }
                    ]
                  }
                  Transform {
                    children [
                      Shape {
                        appearance PBRAppearance {
                        }
                        geometry Cylinder {
                          height 0.013
                          radius 0.003
                          subdivision 6
                        }
                      }
                    ]
                  }
                  Transform {
                    translation 0 0.0065 0
                    children [
                      Shape {
                        appearance PBRAppearance {
                          baseColor 1 0.647059 0
                          metalness 0
                          roughness 0.6
                        }
                        geometry Cylinder {
                          height 0.0001
                          radius 0.002
                        }
                      }
                    ]
                  }
                ]
              }
            ]
            name "${this.selectedDevices[component]["customName"]}"
            boundingObject DEF EPUCK_WHEEL_BOUNDING_OBJECT Transform {
              rotation ${this.selectedDevices[component]["rx"]} ${this.selectedDevices[component]["ry"]} ${this.selectedDevices[component]["rz"]} ${this.selectedDevices[component]["a"]}
              children [
                Cylinder {
                  height 0.005
                  radius 0.02
                  subdivision 24
                }
              ]
            }
            %{ if kinematic == false then }%
              physics DEF EPUCK_WHEEL_PHYSICS Physics {
                density -1
                mass 0.005
              }
            %{ end }%
          }
        }
        `
      }
      if(this.selectedDevices[component]["name"] == "Camera"){
        proto_code += `
        Transform {
          translation ${x} ${y} ${z}
          rotation ${this.selectedDevices[component]["rx"]} ${this.selectedDevices[component]["ry"]} ${this.selectedDevices[component]["rz"]} ${this.selectedDevices[component]["a"]}
          children [
            Camera {
              name "${this.selectedDevices[component]["customName"]}"
              rotation 0 1 0 -1.57
              children [
                Transform {
                  rotation 0 0.707107 0.707107 3.14159
                  children [
                    Transform {
                      rotation IS camera_rotation
                      children [
                        Shape {
                          appearance PBRAppearance {
                            baseColor 0 0 0
                            roughness 0.4
                            metalness 0
                          }
                          geometry IndexedFaceSet {
                            coord Coordinate {
                              point [
                                -0.003 -0.000175564 0.003 -0.003 -0.00247555 -0.003 -0.003 -0.00247555 -4.65661e-09 -0.003 -0.00247555 0.003 -0.003 -2.55639e-05 0.0035 -0.003 -2.55639e-05 -0.003 -0.003 0.000427256 0.00574979 -0.003 -0.000175564 0.0035 -0.003 0.000557156 0.0056748 -0.003 0.00207465 0.00739718 -0.003 0.00214964 0.00726728 -0.003 0.00432444 0.008 -0.003 0.00432444 0.00785 -0.003 0.00757444 0.008 -0.003 0.00757444 0.0095 -0.003 0.0115744 0.0095 -0.003 0.0115744 0.008 -0.003 0.0128244 0.008 -0.003 0.0128244 0.00785 0.003 -2.55639e-05 -0.003 0.003 -0.000175564 0.0035 0.003 -0.000175564 0.003 0.003 -0.00247555 0.003 0.003 -0.00247555 -4.65661e-09 0.003 -0.00247555 -0.003 0.003 -2.55639e-05 0.0035 0.003 0.000427256 0.00574979 0.003 0.000557156 0.0056748 0.003 0.00207465 0.00739718 0.003 0.00214964 0.00726728 0.003 0.00432444 0.00785 0.003 0.00432444 0.008 0.003 0.0115744 0.0095 0.003 0.00757444 0.0095 0.003 0.0115744 0.008 0.003 0.00757444 0.008 0.003 0.0128244 0.00785 0.003 0.0128244 0.008 0 -0.00247555 -0.003 -0.00149971 -0.00247555 -0.0025982 0.00149971 -0.00247555 -0.0025982 0.00259801 -0.00247555 -0.00150004 -0.00259801 -0.00247555 -0.00150004 0.00149971 -0.00247555 0.00259821 0.00259801 -0.00247555 0.00150005 0 -0.00247555 0.003 -0.00149971 -0.00247555 0.00259821 -0.00259801 -0.00247555 0.00150005 0.00212127 -0.00377555 0.00212128 0 -0.00377555 0.003 -0.00212127 -0.00377555 0.00212128 -0.0015 -0.00377555 0.002 -0.002 -0.00377555 0.0015 -0.003 -0.00377555 -4.65661e-09 0.0015 -0.00377555 0.002 0.002 -0.00377555 0.0015 0.003 -0.00377555 -4.65661e-09 -0.002 -0.00377555 -0.0015 0.002 -0.00377555 -0.0015 -0.00212127 -0.00377555 -0.0021213 0.0015 -0.00377555 -0.002 -0.0015 -0.00377555 -0.002 0.00212127 -0.00377555 -0.0021213 0 -0.00377555 -0.003 -0.00256063 -0.00377555 0.00106064 -0.00106063 -0.00377555 0.00256064 0.00106063 -0.00377555 0.00256064 0.00256063 -0.00377555 0.00106064 0.00256063 -0.00377555 -0.00106063 0.00106063 -0.00377555 -0.0025606 -0.00106063 -0.00377555 -0.0025606 -0.00256063 -0.00377555 -0.00106063 0.0015 -0.00417556 -0.002 0.002 -0.00417556 -0.0015 -0.0015 -0.00417556 -0.002 -0.002 -0.00417556 -0.0015 0.002 -0.00417556 0.0015 0 -0.00417556 0.000245125 0.00021198 -0.00417556 0.000122716 0.00021198 -0.00417556 -0.000122714 0 -0.00417556 -0.000245124 -0.00021198 -0.00417556 -0.000122714 -0.00021198 -0.00417556 0.000122716 -0.002 -0.00417556 0.0015 0.0015 -0.00417556 0.002 -0.0015 -0.00417556 0.002
                              ]
                            }
                            coordIndex [
                              33, 14, 35, -1, 13, 35, 14, -1, 15, 32, 16, -1, 34, 16, 32, -1, 14, 33, 15, -1, 32, 15, 33, -1, 72, 74, 60, -1, 61, 60, 74, -1, 74, 75, 61, -1, 57, 61, 75, -1, 75, 83, 57, -1, 52, 57, 83, -1, 83, 85, 52, -1, 51, 52, 85, -1, 85, 84, 51, -1, 54, 51, 84, -1, 84, 76, 54, -1, 55, 54, 76, -1, 76, 73, 55, -1, 58, 55, 73, -1, 73, 72, 58, -1, 60, 58, 72, -1, 72, 73, 74, -1, 75, 74, 73, -1, 76, 77, 78, -1, 76, 78, 79, -1, 79, 80, 75, -1, 79, 75, 73, -1, 73, 76, 79, -1, 75, 80, 81, -1, 75, 81, 82, -1, 82, 77, 76, -1, 82, 76, 83, -1, 83, 75, 82, -1, 76, 84, 83, -1, 85, 83, 84, -1, 56, 68, 23, -1, 41, 23, 68, -1, 68, 62, 41, -1, 40, 41, 62, -1, 62, 69, 40, -1, 40, 69, 63, -1, 38, 40, 63, -1, 63, 70, 38, -1, 39, 38, 70, -1, 70, 59, 39, -1, 42, 39, 59, -1, 59, 71, 42, -1, 42, 71, 53, -1, 2, 42, 53, -1, 53, 64, 2, -1, 47, 2, 64, -1, 64, 50, 47, -1, 46, 47, 50, -1, 50, 65, 46, -1, 46, 65, 49, -1, 45, 46, 49, -1, 49, 66, 45, -1, 43, 45, 66, -1, 66, 48, 43, -1, 44, 43, 48, -1, 48, 67, 44, -1, 44, 67, 56, -1, 23, 44, 56, -1, 48, 49, 50, -1, 51, 48, 50, -1, 52, 51, 50, -1, 50, 53, 52, -1, 48, 51, 54, -1, 48, 54, 55, -1, 56, 48, 55, -1, 57, 52, 53, -1, 55, 58, 56, -1, 59, 60, 61, -1, 59, 61, 57, -1, 53, 59, 57, -1, 60, 59, 62, -1, 58, 60, 62, -1, 62, 56, 58, -1, 59, 63, 62, -1, 0, 45, 22, -1, 21, 0, 22, -1, 45, 0, 3, -1, 38, 39, 1, -1, 40, 38, 24, -1, 41, 40, 24, -1, 24, 23, 41, -1, 1, 39, 42, -1, 2, 1, 42, -1, 22, 43, 44, -1, 23, 22, 44, -1, 45, 43, 22, -1, 46, 45, 3, -1, 47, 46, 3, -1, 3, 2, 47, -1, 20, 26, 7, -1, 6, 7, 26, -1, 26, 28, 6, -1, 9, 6, 28, -1, 28, 31, 9, -1, 11, 9, 31, -1, 31, 35, 11, -1, 13, 11, 35, -1, 34, 37, 16, -1, 17, 16, 37, -1, 36, 18, 37, -1, 17, 37, 18, -1, 36, 30, 18, -1, 12, 18, 30, -1, 4, 8, 25, -1, 27, 25, 8, -1, 8, 10, 27, -1, 29, 27, 10, -1, 10, 12, 29, -1, 30, 29, 12, -1, 25, 19, 4, -1, 5, 4, 19, -1, 24, 38, 19, -1, 19, 38, 1, -1, 5, 19, 1, -1, 20, 7, 21, -1, 0, 21, 7, -1, 19, 20, 21, -1, 19, 21, 22, -1, 19, 22, 23, -1, 24, 19, 23, -1, 20, 19, 25, -1, 26, 20, 25, -1, 25, 27, 26, -1, 28, 26, 27, -1, 27, 29, 28, -1, 28, 29, 30, -1, 31, 28, 30, -1, 32, 33, 34, -1, 34, 33, 35, -1, 36, 34, 35, -1, 36, 35, 31, -1, 30, 36, 31, -1, 37, 34, 36, -1, 0, 1, 2, -1, 3, 0, 2, -1, 0, 4, 5, -1, 1, 0, 5, -1, 4, 0, 6, -1, 6, 0, 7, -1, 8, 4, 6, -1, 6, 9, 8, -1, 10, 8, 9, -1, 9, 11, 10, -1, 12, 10, 11, -1, 11, 13, 12, -1, 14, 15, 13, -1, 13, 15, 16, -1, 12, 13, 16, -1, 12, 16, 17, -1, 18, 12, 17, -1
                            ]
                            creaseAngle 0.785398
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
              fieldOfView IS camera_fieldOfView
              width IS camera_width
              height IS camera_height
              near 0.0055
              antiAliasing IS camera_antiAliasing
              motionBlur IS camera_motionBlur
              noise IS camera_noise
              zoom Zoom {
              }
              %{ if usingDetectionApi == true then }%
              recognition Recognition {
              }
              %{ end }%
            }
          ]
        }`
      }
      if(["Gyro","GPS"].includes(this.selectedDevices[component]["name"])){
        proto_code += `
        ${this.selectedDevices[component]["name"]} {
          translation ${x} ${y} ${z}
          rotation ${this.selectedDevices[component]["rx"]} ${this.selectedDevices[component]["ry"]} ${this.selectedDevices[component]["rz"]} ${this.selectedDevices[component]["a"]}
          name "${this.selectedDevices[component]["customName"]}"
        }
        `;
      }
      if(this.selectedDevices[component]["name"] == "Heat sensor"){
        proto_code += `
        LightSensor {
          translation ${x} ${y} ${z}
          name "${this.selectedDevices[component]["customName"]}"
          lookupTable [
            0 21 0
            2 25 0
            5 30 0
            12 37 0
            1000 38 0
          ]
          colorFilter 1 0 0
          occlusion TRUE
        }
        `;
      }
      if(this.selectedDevices[component]["name"] == "Colour sensor"){
        proto_code += `
        SpotLight {
          attenuation      0 0 12.56
          intensity   0.01
          location    ${x} ${y} ${z}
          direction   0 -1 0
          cutOffAngle 0.3
        }
        Transform {
          translation ${x} ${y} ${z}
          rotation ${this.selectedDevices[component]["rx"]} ${this.selectedDevices[component]["ry"]} ${this.selectedDevices[component]["rz"]} ${this.selectedDevices[component]["a"]}
          children [
            Camera {
              name "${this.selectedDevices[component]["customName"]}"
              rotation 0 1 0 -1.57
              width 1
              height 1
            }
          ]
        }
        `;
      }
      if(this.selectedDevices[component]["name"] == "Distance Sensor"){
        proto_code += `
        DistanceSensor {
          translation ${x} ${y} ${z}
          rotation ${this.selectedDevices[component]["rx"]} ${this.selectedDevices[component]["ry"]} ${this.selectedDevices[component]["rz"]} ${this.selectedDevices[component]["a"]}
          name "${this.selectedDevices[component]["customName"]}"
          lookupTable [
            0 0 0
            0.8 0.8 0
          ]
          type "infra-red"
        }
        `;
      }
      if(this.selectedDevices[component]["name"]== "Accelerometer") {
        proto_code += `
        Accelerometer {
          lookupTable [ -100 -100 0.003 100 100 0.003 ]
          translation ${x} ${y} ${z}
          rotation ${this.selectedDevices[component]["rx"]} ${this.selectedDevices[component]["ry"]} ${this.selectedDevices[component]["rz"]} ${this.selectedDevices[component]["a"]}
        }`;
      }
      if(this.selectedDevices[component]["name"]== "Lidar") {
        proto_code += `
        Transform {
          translation ${x} ${y} ${z}
          rotation ${this.selectedDevices[component]["rx"]} ${this.selectedDevices[component]["ry"]} ${this.selectedDevices[component]["rz"]} ${this.selectedDevices[component]["a"]}
          children [
            Lidar {
              rotation 0 1 0 -1.57
            }
          ]
        }`;
      }
      
    }
    proto_code += `DEF EPUCK_RING SolidPipe {
      translation 0 0.0393 0
      height 0.007
      radius 0.0356
      thickness 0.004
      subdivision 64
      appearance USE EPUCK_TRANSPARENT_APPEARANCE
      enableBoundingObject FALSE
    }`
    proto_code += "\n\t]"
    proto_code += `
        name IS name
      %{ if v2 then }%
        model "GCtronic e-puck2"
      %{ else }%
        model "GCtronic e-puck"
      %{ end }%
      description "Educational robot designed at EPFL"
      boundingObject Group {
        children [
          Transform {
            translation 0 0.025 0
            children [
              Cylinder {
                height 0.045
                radius 0.037
                subdivision 24
              }
            ]
          }
          Transform {
            translation 0 0.0051 0
            children [
              Box {
                size 0.04 0.01 0.05
              }
            ]
          }
        ]
      }
      %{ if kinematic == false then }%
        physics Physics {
          density -1
          %{ if v2 then }%
            mass 0.13
          %{ else }%
            mass 0.15
          %{ end }%
          centerOfMass [0 0.015 0]
          inertiaMatrix [8.74869e-05 9.78585e-05 8.64333e-05, 0 0 0]
        }
      %{ end }%
      controller IS controller
      controllerArgs IS controllerArgs
      customData IS customData
      supervisor IS supervisor
      synchronization IS synchronization
      battery IS battery
      cpuConsumption 1.11 # 100% to 0% in 90[s] (calibrated for the rat's life contest)
      window IS window
    `
    proto_code += "\n}"
    proto_code += closeBracket;
    this.download(this.fileNameField.nativeElement.value+".proto",proto_code);
    console.log(proto_code);

  }

  //https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
  download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
  
}
