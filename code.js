console.log(channel_listings);
let channel_list = [];
		let new_channel = {
			name: '',
			stations: []
		};

		let modal_station_count = 0;

const empty_state_html = `
			<div class="empty-state">
				<div class="flow-text">You have no saved channels. Add one now.</div>
				<a href="#modal1" class="waves-effect waves-light btn modal-trigger">Add Channel</a>
			</div>
		`

		// Empty state check
		renderChannels(channel_list);

		// let add_station_btn = document.getElementById('add-station-btn');
		// add_station_btn.addEventListener('click', e => {
		// 	if (document.querySelector('.station-add').style.display === 'block') {
		// 		document.querySelector('.station-add').style = 'display:none'

		// 	} else {
		// 		document.querySelector('.station-add').style = 'display:block'
		// 	}
		// 	console.log();
		// })
		function renderChannels(channel_list) {
			let channel_list_div = document.getElementById('channel-list');
			if (channel_list.length > 0) {
				channel_list_div.innerHTML = `
				<div class="container">
					<div class="row valign-wrapper">
						<div class="col s10">
							<h6>Channel Name</h6>
						</div>
						<div class="col s2">
							<i id="add-station-btn" class="material-icons right">add</i>
						</div>
					</div>
					<div class="row station-add">
						<div class="col s12">
							<input placeholder="Station URL" type="text">
						</div>
						<div class="col s11">
							<input placeholder="Station Name" type="text">
						</div>
						<div class="col s1" style="padding: 14px 6px;">
							<a href="#"><i class="material-icons right ">add_circle</i></a>
						</div>
					</div>
					<div class="row station-item valign-wrapper">
						<div class="col s8">
							<span class="station-name">Name of the Station</span><br>
							<span class="station-url grey-text">URL of the station</span>
						</div>
						<div class="col s4">
							<a href="#"><i class="material-icons right">close</i></a>
						</div>
					</div>
				</div>`
			} else {
				channel_list_div.innerHTML = empty_state_html;
			}
		}


		// <!-- Modal Add Station -->

		let modal_add_station_btn = document.getElementById('modal-add-station-btn');



		modal_add_station_btn.addEventListener('click', e => {
			let station_list_div = document.getElementById('modal-station-list');
			let station_name = document.getElementById('modal-station-name').value;
			let station_url = document.getElementById('modal-station-url').value;

			let name_valid = document.getElementById('modal-station-name').classList.contains("valid");
			let url_valid = document.getElementById('modal-station-url').classList.contains("valid");

			if (name_valid && url_valid) {

				// check validation
				// element.classList.contains("highlighted");
				//  Increase count
				modal_station_count++;
				// Add to channel
				new_channel.stations.push({
					name: station_name,
					url: station_url
				});

				renderModalStationItem(new_channel.stations);

				M.toast({ html: `${station_name} added` });

				// Clear form
				document.getElementById('modal-station-name').value = '';
				document.getElementById('modal-station-name').classList.remove('valid');
				document.getElementById('modal-station-url').value = '';
				document.getElementById('modal-station-url').classList.remove('valid');

			} else {
				console.log('Add station name and station url');

				if (name_valid) {
					M.toast({ html: 'Enter a valid URL. <br>e.g: http://yp.shoutcast.com/sbin/tunein-station.m3u?id=1796807' })
				} else if (url_valid) {
					M.toast({ html: 'Enter the station name' })
				} else {
					M.toast({ html: 'Enter the station name and the station URL' })
				}
			}

		});

		// <!-- Modal Delete Station -->


		function modalStationDelete(station_index) {
			console.log(new_channel.stations, station_index);
			M.toast({ html: `${new_channel.stations[station_index].name} deleted` });
			new_channel.stations.splice(station_index, 1);
			renderModalStationItem(new_channel.stations);
		}




		function renderModalStationItem(stations) {
			let station_list_div = document.getElementById('modal-station-list');

			if (stations.length > 0) {
				station_list_div.innerHTML = '';

				stations.forEach((station, index) => {
					station_list_div.innerHTML += `
					<div id="modal-station-${index}" class="row station-item valign-wrapper">
						<div class="col s8">
							<span class="station-name">${station.name}</span><br>
							<span class="station-url grey-text">${station.url}</span>
						</div>
						<div class="col s4">
							<a onclick="modalStationDelete('${index}')" data-index="${index}" href="#"><i class="material-icons right">close</i></a>
						</div>
					</div>				
					`
				});
			} else {
				station_list_div.innerHTML = '';
			}
		}

		// <!-- Modal Save Channel -->

		let modal_station_save_btn = document.getElementById('modal-channel-save');

		modal_station_save_btn.addEventListener('click', e => {
			let channel_name = document.getElementById('modal-channel-name').value;

			if (channel_name && new_channel.stations.length > 0) {
				// console.log('clicked');
				new_channel.name = channel_name;
				modal_station_save_btn.classList.add('modal-close');

				// Add new channel to channel list
				channel_list.push(new_channel);
				// Render channels
				renderChannels(channel_list);
				M.toast({ html: `${channel_name} channel saved with ${new_channel.stations.length} stations` });
			} else {
				if (channel_name) {
					M.toast({ html: `Add at least one station` });
				} else {
					M.toast({ html: `Give a name to the channel` });
					document.getElementById('modal-channel-name').focus();
				}
			}
		})
