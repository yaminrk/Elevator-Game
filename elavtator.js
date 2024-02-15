{
    init: function(elevators, floors) {
        var requests = []; // Queue to hold the requests

        // For each floor, listen for up and down button presses
        floors.forEach(function(floor) {
            floor.on("up_button_pressed", function() {
                if (!requests.includes(floor.floorNum())) {
                    requests.push(floor.floorNum());
                }
            });
            floor.on("down_button_pressed", function() {
                if (!requests.includes(floor.floorNum())) {
                    requests.push(floor.floorNum());
                }
            });
        });

        // For each elevator, listen for idle, floor_button_pressed, and passing_floor events
        elevators.forEach(function(elevator) {
            elevator.on("idle", function() {
                if (requests.length > 0) {
                    var nextFloor = requests.shift(); // Get the next floor from the queue
                    elevator.goToFloor(nextFloor);
                }
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                if (!elevator.destinationQueue.includes(floorNum)) {
                    elevator.goToFloor(floorNum, true);
                }
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                var index = requests.indexOf(floorNum);
                if (index > -1) {
                    requests.splice(index, 1); // Remove the floor from the queue
                }
            });
            elevator.on("passing_floor", function(floorNum, direction) {
                if (requests.includes(floorNum)  && elevator.loadFactor() < 0.5) {
                    elevator.goToFloor(floorNum, true);
                }
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
        elevators.forEach(function(elevator) {
            elevator.destinationQueue.sort(function(a, b) {
                // Sort the destination queue based on the distance from the current floor
                return Math.abs(a - elevator.currentFloor()) - Math.abs(b - elevator.currentFloor());
            });
            elevator.checkDestinationQueue(); // Apply the new destination order immediately
        });
    }
}