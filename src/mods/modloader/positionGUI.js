
(function() {
    let runtime = cr_getC2Runtime();

    let settings = JSON.parse(localStorage.getItem("modSettings"))['mods']['positionGUI']['settings'];

    let currentMouseCoords = [];
    var elementMoving = null;
    var startingMouseCoords = []; 

    let moving = false;

    let enabled = true;


    globalThis.positionGUIToggleMoving = function (enable) {
        moving = enable;
        document.getElementById("gui-position").style.cursor = enable ? "grab" : "default";
    }

    globalThis.positionGUIToggle = function (enable) {
        if (enable) {
            enabled = true;
        } else {
            document.getElementById("gui-position").style.display = "none";
            enabled = false;
        }
    }

    globalThis.positionGUISettingsUpdate = function () {
        settings = JSON.parse(localStorage.getItem("modSettings"))['mods']['positionGUI']['settings'];
        let position = document.getElementById("gui-position")
        position.style.top = `${settings["position"].split(' ')[0]}px`;
        position.style.left = `${settings["position"].split(' ')[1]}px`;
        position.style.transform = `scale(${settings["scale"]})`;
        position.style.opacity = `${settings["opacity"]}`;
        position.style.color = settings["textcolor"];
        position.style.backgroundColor = settings["backgroundcolor"];
        position.style.border = settings["border"] ? "2px solid black" : "none";
        
        

    }

    let isInLevel = () => {
        return runtime.running_layout.name.startsWith("Level")
    };

    let notify = (text, title = "", image = "./speedrunner.png") => {
        cr.plugins_.sirg_notifications.prototype.acts.AddSimpleNotification.call(
          runtime.types_by_index.find(
            (type) => type.plugin instanceof cr.plugins_.sirg_notifications
          ).instances[0],
          title,
          text,
          image
        );
      };

    let detectDeviceType = () => 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'pc';

    let createGuiElement = (id1, top, left, name) => {
        let b = document.createElement("div")
        let c = {
            backgroundColor: settings["backgroundcolor"],
            border: settings["border"] ? "2px solid black" : "none",
            fontFamily: "Retron2000",
            position: "absolute",
            top: `${top}px`,
            left: `${left}px`,
            padding: "5px",
            color: settings["textcolor"],
            fontSize: "10pt",
            transform: `scale(${settings["scale"]})`,
            opacity: `${settings["opacity"]}`, 
            display: "block",
            cursor: "default",
            zIndex: "1000",
            userSelect: "none",
        };
        Object.keys(c).forEach(function (a) {
            b.style[a] = c[a];
        });
        b.id = id1;
        b.name = name;
        const newContent = document.createTextNode("N/A");

        b.appendChild(newContent);

        b.addEventListener('mousedown', (event) => {
            //onsole.log(event.button)
            if(event.button === 0 && moving) {
                elementMoving = b;
                startingMouseCoords = [event.clientX, event.clientY]
            }
            
        });
        b.addEventListener('mouseup', (event) => {
            if(event.button === 0 && elementMoving !== null && moving) {
                settings = JSON.parse(localStorage.getItem("modSettings"));
                settings['mods']['positionGUI']['settings']["position"] = `${parseInt(elementMoving.style.top)} ${parseInt(elementMoving.style.left)}`;
                localStorage.setItem('modSettings', JSON.stringify(settings));

                elementMoving = null;
                startingMouseCoords = null;
            }
            
        });
        b.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1 && moving) {
                elementMoving = b;
                startingMouseCoords = [event.touches[0].clientX, event.touches[0].clientY];
            }
        });

        b.addEventListener('touchmove', (event) => {
            if (elementMoving !== null && event.touches.length === 1 && moving) {
                currentMouseCoords = [event.touches[0].clientX, event.touches[0].clientY];
                elementMoving.style.left = (currentMouseCoords[0] - startingMouseCoords[0] + parseInt(elementMoving.style.left)).toString() + 'px';
                elementMoving.style.top = (currentMouseCoords[1] - startingMouseCoords[1] + parseInt(elementMoving.style.top)).toString() + 'px';
                startingMouseCoords = currentMouseCoords;
            }
        });

        b.addEventListener('touchend', (event) => {
            if (elementMoving !== null && moving) {
                settings = JSON.parse(localStorage.getItem("modSettings"));
                settings['mods']['positionGUI']['settings']["position"] = `${parseInt(elementMoving.style.top)} ${parseInt(elementMoving.style.left)}`;
                localStorage.setItem('modSettings', JSON.stringify(settings));

                elementMoving = null;
                startingMouseCoords = null;

            }
        });

        return b;

    }

    let positionGUI = {
        init() {

            document.addEventListener('mousemove', (event) => {
                currentMouseCoords = [event.clientX, event.clientY]
            });
            
            let positionElement = createGuiElement('gui-position', settings["position"].split(' ')[0], settings["position"].split(' ')[1], "position")
            document.body.appendChild(positionElement);
            runtime.tickMe(this);
            console.log("init complete")
            notify("by Awesomeguy", "Position GUI Loaded", "../src/img/mods/positionGUI.png");
        },



        tick() {
            try {
                if (!enabled) {
                    return;
                }
                if((isInLevel() && runtime.running_layout.name !== "Level Menu") || moving ) {
                    let playerInstances = runtime.types_by_index.filter((x) =>!!x.animations &&x.animations[0].frames[0].texture_file.includes("collider"))[0].instances.filter((x) => x.instance_vars[17] === "" && x.behavior_insts[0].enabled);
                    let player = playerInstances[0];        
                    document.getElementById("gui-position").style.display = "block";
                    document.getElementById("gui-position").innerHTML = Math.round(player.x.toString()) + ", " + Math.round(player.y.toString());
                } else {
                    // console.log("cuh^2")
                    document.getElementById("gui-position").style.display = "none";
                }
                if (detectDeviceType() === "pc") {
                    if(elementMoving !== null && moving) {
                        elementMoving.style.left = (currentMouseCoords[0] - startingMouseCoords[0] + parseInt(elementMoving.style.left)).toString() + 'px';
                        elementMoving.style.top = (currentMouseCoords[1] - startingMouseCoords[1] + parseInt(elementMoving.style.top)).toString() + 'px';
                        startingMouseCoords  = currentMouseCoords;
                    }
                }
            } catch {}
            
        },

        toString() { //need tostring because add tick obj ios bug
            return "awesomeguy.positionGUI";
        }
    };
    positionGUI.init();
})();