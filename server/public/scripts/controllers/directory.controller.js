myApp.controller('DirectoryController', function (ProspectsService, UserService, $http, $scope, $mdDialog) {
    console.log('DirectoryController created');
    $scope.currentNavItem = 'directory'; // tells nav bar which item to indicate as 'selected'

    UserService.getuser();

    var vm = this;
    vm.sortMethod = 'lastname';
    vm.reverse = false;
    vm.query = '';

    vm.directory = {
        list: []
    };

    vm.approval = {
        list: []
    };
    vm.profile = ProspectsService.profile;

    vm.sortMethod = 'lastname';
    vm.reverse = false;
    vm.query = '';

    vm.sort = function (method) {
        vm.reverse = (vm.sortMethod === method) ? !vm.reverse : false;
        vm.sortMethod = method;
    };

    vm.getDirectory = function () {
        ProspectsService.getDirectory();
        vm.directory = ProspectsService.directory;
        console.log('directory controller hit with', vm.directory);
    };

    $scope.showProfile = function (ev, id) {
        console.log('showProfile called for user: ', id);
        vm.getProfile(id);
        console.log('prospect profile', vm.profile.list);
        $mdDialog.show({
            controller: DialogController,
            templateUrl: '/views/templates/prospect.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
            .then(function (answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
    };

    function DialogController(ProspectsService, $scope, $mdDialog, $route) {
        $scope.profile = ProspectsService.profile;
        $scope.connections = ProspectsService.connections;

        $scope.pencil = {};
        $scope.commentsOn = false;
        $scope.deleteConfirm = false;
        $scope.editOn = false;
        $scope.isApproved = false;
        $scope.commentIn = '';
        // hold true/false values for ng-shows
        // must set all editBoolean values for array columns as arrays
        $scope.editBoolean = {
            involvement: [],
            howhelp: [],
            ecosystem: [],
        };

        $scope.updateArray = function (id, index, value, column) {
            // grab profile id, index of array value, input value, and array name (column)
            // console.log('updateArray values: ', id, index, value, column);
            if (value == undefined) {
                // console.log('No value input.');
                // toggle editBoolean
                $scope.editBoolean[column][index] = !$scope.editBoolean[column][index];
            } else if (value == '') {
                // console.log('Delete array index value: ', value);
                // remove array value, update array, toggle editBoolean
                vm.profile.list[0][column].splice(index, 1);
                ProspectsService.updateDetails(id, vm.profile.list[0][column], column);
                $scope.editBoolean[column][index] = !$scope.editBoolean[column][index];
            } else {
                // console.log('update array values id, index, value, column: ', id, index, value, column);
                // edit array value, update array, toggle editBoolean
                vm.profile.list[0][column][index] = value;
                ProspectsService.updateDetails(id, vm.profile.list[0][column], column);
                $scope.editBoolean[column][index] = !$scope.editBoolean[column][index];
            }
        };
        $scope.addArray = function (id, value, column) {
            // console.log('addArray values id, value, column ', value);
            var columnAdd = column + 'Add';
            if (value == undefined || value == '') {
                console.log('No value input.');
                $scope.editBoolean[columnAdd] = !$scope.editBoolean[columnAdd];
            } else {
                // add value to array, call updateDetails, toggle EditBoolean
                vm.profile.list[0][column].push(value);
                ProspectsService.updateDetails(id, vm.profile.list[0][column], column);
                $scope.editBoolean[columnAdd] = !$scope.editBoolean[columnAdd];
            }
        };

        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
            vm.getDirectory();
        };
        $scope.delete = function (id) {
            console.log('delete account func called for user id: ', id);
            ProspectsService.deleteProfile(id);
            $mdDialog.cancel();
            $scope.reloadRoute();
        };
        $scope.approve = function (id, status) {
            ProspectsService.updateApproval(id, status);
            $scope.isApproved = !$scope.isApproved;
            console.log('you clicked me!', id, status, "toggle connections shown:", vm.approved);
            $scope.cancel();
        };
        $scope.updateComments = function (id, comment) {
            console.log('comment func called with id and comment: ', id, comment);
            ProspectsService.updateComments(id, comment);
            $scope.editBoolean.comments = !$scope.editBoolean.comments;
        };

        $scope.updateDetails = function (id, details, column) {
            console.log('update details with', id, details, column);
            // check if user has alerted info, cancel if nothing change
            if (details !== undefined) {
                ProspectsService.updateDetails(id, details, column);
                $scope.editBoolean[column] = !$scope.editBoolean[column];
                // console.log('editBoolean.', column, ': ', $scope.editBoolean[column]);
            } else {
                $scope.showEdit(column);
            }
        };
        $scope.showEdit = function (input) {
            $scope.editBoolean[input] = !$scope.editBoolean[input];
            // console.log('$scope.editBoolean.', input, ': ', $scope.editBoolean[input]);
        };

        $scope.showEditArray = function (input, index) {
            $scope.editBoolean[input][index] = !$scope.editBoolean[input][index];
            // console.log('$scope.editBoolean.', input, '[', index, ']', ': ', $scope.editBoolean[input][index]);
        };

        // $scope.testFunction = function(input){            // testing function
        //     console.log('testFunction called with input array: ', input);
        // };

        $scope.addConnection = function (id1, id2) {
            ProspectsService.addConnection(id1, id2);
            console.log('you clicked me!', id1, id2);
        };

        $scope.deleteConnection = function (id1, id2) {
            ProspectsService.deleteConnection(id1, id2);
            console.log('Profile ID:', id1, id2);

        };

        $scope.connectionComment = function (id, comment) {
            ProspectsService.connectionComment(id, comment).then(function () {
                console.log('Connection Comments:', id, comment);
                $scope.getProfile($scope.profile.list[0].id, id);
            });
        };

        $scope.showComments = function (id, index) {
            $scope.commentsOn = !$scope.commentsOn;
            $scope.commentsColorOn = {};
            if ($scope.commentsOn === true){
                $scope.commentsColorOn[index] = !$scope.commentsColorOn[index];
            }
            console.log($scope.connections.list);
            for (var i = 0; i < $scope.connections.list.length; i++) {

                if (id == $scope.connections.list[i].id) {
                    console.log('comments from', $scope.connections.list[i].firstname, $scope.connections.list[i].lastname, ":", $scope.connections.list[i].comments);
                    $scope.connections.comment = ProspectsService.connections.list[i].comments;
                    $scope.connections.id = id;
                    $scope.connections.firstname = ProspectsService.connections.list[i].firstname;
                    $scope.connections.lastname = ProspectsService.connections.list[i].lastname;
                }
            }
            return $scope.connections.comment;
        };

        $scope.getProfile = function (profileId, connectionId) {
            ProspectsService.getProfile(profileId).then(function () {
                ProspectsService.getConnections(profileId).then(function () {
                    $scope.connections = ProspectsService.connections;
                    $scope.showComments(connectionId);
                });
            });
            $scope.profile = ProspectsService.profile;
        };

        $scope.showEditComment = function () {
            $scope.editOn = !$scope.editOn;


        };

        $scope.reloadRoute = function (id) {
            $route.reload(id);
        };

        $scope.$watchCollection('profile.list[0].tags', function () {
            ProspectsService.changeTag($scope.profile.list[0].id);
        });

        $scope.getSearch = function () {

            $scope.searchTextChange = function (text) {
                console.log('Text changed to', text);
            };

            $scope.selectedItemChange = function (item) {
                console.log('Item changed to', item.id);
            };

            $scope.loadAll = function () {
                // var allListings = "Greg, Cam, Mike, Katie, Evan, Nestor";
                var list = [];
                // var personId = [];
                console.log('DIRECTORY:', vm.directory.list);
                for (var i = 0; i < vm.directory.list.length; i++) {
                    list.push({
                        name: vm.directory.list[i].firstname + ' ' + vm.directory.list[i].lastname,
                        id: vm.directory.list[i].id
                    });
                    // personId.push(vm.directory.list[i].id);
                }
                console.log('LIST:', list);
                console.log('id', vm.directory.list.id);
                var allListings = list.map(function (person) {

                    return {
                        value: person.name.toLowerCase(),
                        display: person.name,
                        id: person.id
                    };
                });
                return allListings;
            };

            $scope.createFilterFor = function (query) {
                var lowerCaseQuery = angular.lowercase(query);
                return function filterFn(listing) {
                    return (listing.value.indexOf(lowerCaseQuery) === 0);
                };
            };

            $scope.querySearch = function (query) {
                if (query) {
                    var results = query ? $scope.listings.filter($scope.createFilterFor(query)) : $scope.listings;
                    return results;
                } else {
                    return [];
                }
            };

            $scope.listings = $scope.loadAll();
            // vm.searchText = "";
        };
    }

    $scope.showSettings = function (ev) {
        console.log('showSettings called');
        $mdDialog.show({
            controller: SettingsDialogController,
            templateUrl: '/views/templates/user.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
            .then(function (answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
    };

    function SettingsDialogController(UserService, $scope, $mdDialog, $route) {
        
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.userObject = UserService.userObject;
        $scope.userObject.message = 'Here you can update admin info including your email and password.';

        $scope.updateEmail = function (email) {
            if ($scope.email === $scope.emailConfirm) {
                UserService.updateEmail(email);
                $scope.userObject.message = 'Your email has been successfully changed'
                $scope.email = '';
                $scope.emailConfirm = '';
                $scope.emailUpdate = !$scope.emailUpdate;
            } else {
                $scope.userObject.message = 'Email addresses didn\'t match';
                $scope.email = '';
                $scope.emailConfirm = '';
            }
        }

        $scope.updatePassword = function (password) {
            if ($scope.password === $scope.passwordConfirm) {
                UserService.updatePassword(password);
                $scope.userObject.message = 'Your password has been successfully changed'
                $scope.password = '';
                $scope.passwordConfirm = '';
                $scope.passwordUpdate = !$scope.passwordUpdate;
            } else {
                $scope.userObject.message = 'Passwords didn\'t match';
                $scope.password = '';
                $scope.passwordConfirm = '';
            }
        }

        $scope.resetMsg = function () {
            $scope.userObject.message = 'Here you can update admin info including your email and password.';
        }
    };

    vm.getApproval = function () {
        ProspectsService.getApproval();
        vm.approval = ProspectsService.approval;
        console.log('directory controller hit with', vm.approval);
    };

    vm.getProfile = function (id) {
        ProspectsService.getProfile(id).then(function () {
            ProspectsService.getConnections(id).then(function () {
                $scope.connections = ProspectsService.connections;
                // $scope.showComments(id);                
            });
        });
        vm.profile = ProspectsService.profile;
    };

    vm.getComments = function (id, comment) {
        ProspectsServices.updateComments(id, comment);
        console.log('service comment', id, comment);
    };

}); // end controller