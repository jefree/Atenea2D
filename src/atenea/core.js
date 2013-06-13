(function(){

	var Atenea = function(){

        var self = this;

		self.init = function(w, h, domParent){

			self.canvas.init(w, h, domParent);

            // select best function for animFrame

            window.requestAnimFrame = (function(){
                return  window.requestAnimationFrame       ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame    ||
                        function( callback ){
                            window.setTimeout(callback, 1000 / 60);
                        };
            })();
		}

        self.register = function(id, model){

            newModel = {}

            for(f in model){
                newModel[f] = model[f];
            }

            self.models[id] = newModel;
        }

        self.parse = function(type, object){

            if (typeof(type) == 'string'){

                var e = {};

                if(object !== undefined){
                    e = object;
                }

                var models = type.split(/,\s|,/);

                for (n in models){
                    self.add(e, models[n]);
                }

                return e;
            }
        }

        self.add = function(e, model){

            if(model in self.models){

                for(attr in self.models[model]){

                    if (! (attr in e) ){

                        e[attr] = self.models[model][attr];
                    }
                }

                if("init" in self.models[model]){
                    self.models[model].init.call(e);
                }
            }
        }

        self.scene = function(id, scene){

            if (scene === undefined){
                self.activeScene = self.scenes[id];
                return;
            } 

            self.scenes[id] = scene;
        }

        self.start = function(id){

            self.activeScene = self.scenes[id];
            
            self.animLoop();
        }

        self.draw = function(){

            entities = self.activeScene.entities;

            for (var i=0; i<entities.length; i++){
                entities[i].draw(self.canvas.context);
            }
        }

        self.update = function(){
            console.log('update');
        }

        self.animLoop = function(){

            requestAnimFrame(self.animLoop);
            self.update();
            self.draw();
        }

		self.canvas = new (function(){

            var self = this;

			self.init = function(w, h, domParent){

				self.domElement = document.createElement('canvas');
				self.context = self.domElement.getContext('2d');

                self.domElement.width = w;
                self.domElement.height = h;

				if(domParent !== undefined){
					domParent.appendChild(self.domElement);
				}else{
					document.body.appendChild(self.domElement);
				}
			}

			self.size = function(){

				if(arguments.length == 2){

					self.domElement.width = arguments[0];
					self.domElement.height = arguments[1];

				}
				else if (arguments.length == 0){

					return {
						width:self.domElement.width, 
						height:self.domElement.height
					};
				}
			}
		})();

        self.activeScene = undefined;

        self.scenes = {};
        self.models = {};
	}

    window.Atenea = new Atenea();

})();