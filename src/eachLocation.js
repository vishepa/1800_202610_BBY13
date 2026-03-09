


import { doc, getFirestore } from "firebase/firestore";


const tile = document.querySelector('#tile-container');


function createTile(name, waitTime, imageUrl) {

    const newTile = document.createElement('div',);
    newTile.classList.add('location-tiles', 'w-100', 'card-bg', 'd-flex', 'flex-column', 'gap-3', 'p-3', 'rounded');

    newTile.innerHTML = `

       <!-- Image Column -->
                <div class="d-flex flex-row gap-3 align-items-center">
                    <div class="cafe-img-wrapper rounded-start w-25">
                        <img src="./images/delicious-burger-studio.jpg" alt="Tim Hortons">
                    </div>
    
                    <!-- Text Column -->
                    <div class="col-8">
                        <div class="card-body card-spacing">
                            <h5 class="card-title title-spacing">Triple O's</h5>
    
                            <p class="mb-1">
                                <strong>Distance:</strong> 150m away
                            </p>
    
                            <p class="mb-1">
                                <strong>Crowd Level:</strong>
                                <span class="text-danger">Busy</span>
                            </p>
    
                            <p class="mb-0">
                                <strong>Expected Wait Time:</strong> 10–15 mins
                            </p>
                        </div>
                    </div>
    
                </div>
                <div class="collapse w-100 gap-1 align-items-center" id="tripleO-collapse">
                    <div class="card card-body w-100">
                        <h4>Triple O's</h4>
                        <h5> 150m away</h5>
                        <h5> Crowd Level: Busy</h5>
                        <h5> Expected Wait Time: 10–15 mins</h5>
    
                        <button id="confirm" type="button" class="btn btn-primary w-25 gap-1 m-2">Confirm Wait Time</button>
    
                        <button id="update" type="button" class="btn btn-primary w-25 gap-1 m-2">Update Wait Time</button>
                        <div class="collapse w-50 gap-1 align-items-center" id="update-collapse">
                            <div class="card card-body w-100">
                                <div class="button-container">
                                    <button type="button" class="btn btn-secondary w-25 gap-1 m-2">5 mins</button>
                                    <button type="button" class="btn btn-secondary w-25 gap-1 m-2">10 mins</button>
                                    <button type="button" class="btn btn-secondary w-25 gap-1 m-2">15 mins</button>
    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>





    `;

}
