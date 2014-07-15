module.exports = function (grunt) {
	
	require('load-grunt-tasks')(grunt);
	
	// Project configuration.
	grunt.initConfig({
		
        less: {
            dist: {
                files: {
                  "css/style.css": "css/style.less"
                }
            }
        },
        
        cssmin: {
          dist: {
            files: {
               'build/css/min.css': ['css/style.css']
            }
          }
        },
        
		jshint: {
			all: ['js/*.js','!js/*min.js']
		},
		
		uglify: {
			dist: {
			  files: {
				'js/min.js': ['js/*.js','!js/*min.js']
			  }
			}
		},
        
        concat: {
            options: {
              separator: '',
            },
            dist: {
              src: ['bower_components/jquery/dist/jquery.min.js','js/min.js'],
              dest: 'build/js/min.js',
            }
        },
        
        imagemin: {                 
            dist: {                         
              files: {                         
                'build/img/rapp_1_min.jpg': 'img/rapp_1.jpg',
                'build/img/rapp_2_min.jpg': 'img/rapp_2.jpg', 
              }
            }
          },

		watch: {
			js: {
				files: ['js/*.js','!js/min.js'],
				tasks: ['js']
			},
            css: {
                files: ['css/*.less'],
				tasks: ['css']
            }
		}

	});
    
    grunt.registerTask('css', ['less','cssmin']);
    grunt.registerTask('js', ['jshint','uglify','concat']);
    grunt.registerTask('html', ['htmlmin']);
    grunt.registerTask('default', ['less','cssmin','jshint','uglify','concat','imagemin']);
	
}
