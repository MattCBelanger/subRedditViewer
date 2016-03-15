
(function() {
    'use strict';
    
    angular
        .module('subReddit')
        .service('RedditSrv',RedditSrv);
            
     
    
    RedditSrv.$inject = ['ApiSrv','toastr','UserSrv'];
    
    function RedditSrv(ApiSrv,toastr,UserSrv){
        var ctrl = this;
        //injectables
        ctrl.ApiSrv = ApiSrv;
        ctrl.UserSrv = UserSrv;
           
        //view variables
        ctrl.fullList=[];
        ctrl.subReddits = [];
        ctrl.hoverImage = '';
        //local variables
        var limit = 10;
        var filter = 'hot';
        
        //Exports
         var service = {
            getReddit:getReddit,
            removeSub:removeSub,
            updateReddits : updateReddits,
            fullList: ctrl.fullList,
            activate:activate,
            subReddits: ctrl.subReddits,
            hoverImage: ctrl.hoverImage
        }
        return service;
                
        /////////////////////////////
        function activate() {
            var ctrl = this;
            ctrl.fullList = [];
            ctrl.subReddits = JSON.parse(localStorage.subReddits);
            ctrl.updateReddits(0);
            
        }         
        
        function getReddit (search) {
            var ctrl = this;
            var searchUnique = true;
            
            for (var i=0;i<ctrl.subReddits.length;i++) {
                if(ctrl.subReddits[i]===search){
                    searchUnique = false;
                     toastr.error('You are already subcribed to that reddit', 'Error');	
                }
            }
            
            if (searchUnique) {
                ApiSrv.getRequest(search,filter,limit)
                .then (function (data) {
                    if (data.data && !data.data.error) {
                        var temp = data.data.data.children;
                        ctrl.fullList.push(temp);
                        ctrl.subReddits.push(search);
                        localStorage.subReddits = JSON.stringify(ctrl.subReddits);
                        UserSrv.updateUser(ctrl.subReddits);
                        //localStorage.savedReddits = JSON.stringify(ctrl.fullList);
                    } else {
                         toastr.error('Please enter a valid subreddit name. Remember no spaces allowed', 'Error');
                    }
                });                 
            };
        }
          
        function removeSub(index) {
            var ctrl = this;
        
            ctrl.fullList.splice(index,1);
            ctrl.subReddits.splice(index,1);
            
           // localStorage.savedReddits = JSON.stringify(ctrl.fullList);
            localStorage.subReddits = JSON.stringify(ctrl.subReddits);
        }
        
        function updateReddits(index) {
            var ctrl = this;
            ctrl.index = index;
            
            if (ctrl.subReddits[index]) {
                ApiSrv.getRequest(ctrl.subReddits[ctrl.index],filter,limit)
                    .then (function(res) {
                        var temp = res.data.data.children;
                        //update local varibale with no ones
                        // for (var i = 0; i < temp.length;i++) {
                        //     if ((ctrl.fullList[ctrl.index][i])) {
                        //         ctrl.fullList[ctrl.index][i].data = temp[i].data;
                        //     }
                        // }   
                        ctrl.fullList.push(temp);
                        
                        //localStorage.savedReddits = JSON.stringify(ctrl.fullList);
                        
                        //recursive call
                        if ((ctrl.index+1) < ctrl.subReddits.length) {
                            ctrl.index = ctrl.index+1;
                            ctrl.updateReddits(ctrl.index);
                        }
                });
            }
        }
        
        

    } 

    
})();