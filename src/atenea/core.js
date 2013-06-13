(function(){

	Atenea = {

		init : function(w, h, domParent){

			this.canvas.init(w, h, domParent);

            // select best function for animFrame

            window.requestAnimFrame = (function(){
                return  window.requestAnimationFrame       ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame    ||
                        function( callback ){
                            window.setTimeout(callback, 1000 / 60);
                        };
            })();
		},

        register: function(id, model){

            newModel = {}

            for(f in model){
                newModel[f] = model[f];
            }

            this.models[id] = newModel;
        },

        parse : function(type, object){

            if (typeof(type) == 'string'){

                var e = {};

                if(object !== undefined){
                    e = object;
                }

                var models = type.split(/,\s|,/);

                for (n in models){
                    this.add(e, models[n]);
                }

                return e;
            }
        },

        add : function(e, model){

            if(model in this.models){

                for(attr in this.models[model]){

                    if (! (attr in e) ){

                        e[attr] = this.models[model][attr];
                    }
                }

                if("init" in this.models[model]){
                    this.models[model].init.call(e);
                }
            }
        },

        scene : function(id, scene){

            if (scene === undefined){
                this.activeScene = this.scenes[id];
                return;
            } 

            this.scenes[id] = scene;
        },

        start : function(id){

            this.activeScene = this.scenes[id];
            
            this.animLoop();
        },

        draw : function(){

            entities = this.activeScene.entities;

            for (var i=0; i<entities.length; i++){
                entities[i].draw(this.canvas.context);
            }
        },

        update : function(){
            console.log('update');
        },

        animLoop : function(){

            requestAnimFrame(Atenea.animLoop);
            Atenea.update();
            Atenea.draw();
        },

		canvas : {

			init : function(w, h, domParent){

				this.domElement = document.createElement('canvas');
				this.context = this.domElement.getContext('2d');

                this.domElement.width = w;
                this.domElement.height = h;

				if(domParent !== undefined){
					domParent.appendChild(this.domElement);
				}else{
					document.body.appendChild(this.domElement);
				}
			},

			size : function(){

				if(arguments.length == 2){

					this.domElement.width = arguments[0];
					this.domElement.height = arguments[1];

				}
				else if (arguments.length == 0){

					return {
						width:this.domElement.width, 
						height:this.domElement.height
					};
				}
			}
		},

        activeScene : undefined,
        pause : false,

        scenes : {},
        models : {}
	}

})();