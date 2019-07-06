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
getStations();

function showAddStation(channel_name, event) {
	event.preventDefault();
	if (document.querySelector(`.${channel_name}-station-add`).style.display === 'block') {
		document.querySelector(`.${channel_name}-station-add`).style = 'display:none'
		document.querySelector(`#${channel_name}-show-add`).innerHTML = 'add'
	} else {
		document.querySelector(`.${channel_name}-station-add`).style = 'display:block'
		document.querySelector(`#${channel_name}-show-add`).innerHTML = 'close'
	}
}

function channelAddStation(channel_name, event) {

	event.preventDefault();
	let channel_div = document.getElementById(channel_name);

	let station_name = document.getElementById(`${channel_name}-station-name`).value;
	let station_url = document.getElementById(`${channel_name}-station-url`).value;

	if (station_name && station_url) {
		renderStationItem(station_name, station_url, channel_div);
		// Toast
		M.toast({ html: `${station_name} added` });

		for (const [channel_index, channel] of channel_list.entries()) {
			if (channel.name === channel_name.replace(/-/g, ' ')) {

				// Clear input fields
				document.getElementById(`${channel_name}-station-name`).value = '';
				document.getElementById(`${channel_name}-station-url`).value = '';
				
				let new_station = {
					name: station_name,
					url: station_url
				}
				channel_list[channel_index].stations.push(new_station);
				console.log('channel_list', channel_list);
				saveStations(channel_list);
			} else {
				console.log(channel_index, channel.name, channel_name);
			}
		}

		
	} else {
		M.toast({ html: `Add station name and station URL` });

	}
}

function deleteStation(channel_name, station_name, event) {
	event.preventDefault();
	for (const [channel_index, channel] of channel_list.entries()) {
		if (channel.name === channel_name) {
			for (const [index, station] of channel.stations.entries()) {
				// for (const station of channel.stations) {
				if (station.name === station_name) {
					console.log(index, station);
					console.log();
					channel_list[channel_index].stations.splice(index, 1);
					renderChannels(channel_list);
					saveStations(channel_list);
				}
			}
		}
		// console.log(channel);
	}
}

function renderStationItem(station_name, station_url, channel_div) {
	let station_item = createNode('div', ['row', 'station-item', 'valign-wrapper']);
	station_item.innerHTML = `
						<div class="col s10">
							<span class="station-name">${station_name}</span><br>
							<span class="station-url grey-text">${station_url}</span>
						</div>
						<div class="col s2">
							<a href="#"><i class="tiny material-icons right">close</i></a>
						</div>
					`;
	channel_div.appendChild(station_item);
}

function getStations() {
	axios({
		url: 'https://tinkr.api.stdlib.com/radio@dev/stations/',
		method: "GET"
	})
		.then(result => {
			console.log('result', result.data);
			// Empty state check
			channel_list = result.data;
			renderChannels(channel_list);
			// Listen to Channel Name Edit
			let channel_names = document.querySelectorAll('.channel-name');
			console.log(channel_names);

			channelRenameListener(channel_names);

		})
}

function channelRenameListener(channel_names) {
	channel_names.forEach(channel_name => {
		channel_name.addEventListener('keypress', e => {
			// Listen for submit
			if (e.keyCode == 13) {
				console.log(channel_name);
				e.preventDefault();
				e.target.blur();
			}
		});
		channel_name.addEventListener('blur', e => {
			e.preventDefault();
			// Listen for submit
			console.log(e.target.textContent);
			let index = e.target.getAttribute('data-index');
			// Update channel list
			channel_list[index].name = e.target.textContent;
			saveStations(channel_list);
			console.log(channel_list);
		});
	});
}

function saveStations(channels) {
	axios({
		url: `https://tinkr.api.stdlib.com/radio@dev/stations?status=update&channels_list=${JSON.stringify(channels)}`,
		method: "GET"
	})
		.then(result => {
			console.log('result', result);
		})
		.catch(error => {
			console.log('error', error);
		})
}

function renderChannels(channel_list) {
	let channel_list_div = document.getElementById('channel-list');
	channel_list_div.innerHTML = '';
	let channels = Object.keys(channel_list);
	// console.log(channels);

	if (channels.length > 0) {
		for (const [index, channel] of channels) {
			let channel_info = channel_list[index];
			console.log(channel_info);
			let channel_name = channel_info.name.replace(/ /g, '-');

			let channel_div = createNode('div', ['container', 'channel-item', 'card']);
			channel_div.id = channel_name;
			channel_div.innerHTML = `
			<form class="row">
				<div class="col s1 left" style="padding-top: 10px;">
					<i class="material-icons">queue_music</i>
				</div>
				<div class="col s10">
					<h6 data-index="${index}" class="channel-name" contenteditable="true">${channel_info.name}</h6>
				</div>
				<div class="col s1" style="padding-top: 10px;">
				<a onclick="showAddStation('${channel_name}', event)" class="add-station-btn" href="#"><i id="${channel_name}-show-add" class="material-icons right">add</i></a>
				</div>
			</div>
			<div class="row ${channel_name}-station-add" style="display:none">
				<div class="col s12">
					<input id="${channel_name}-station-url" placeholder="Station URL" type="text">
				</div>
				<div class="col s11">
					<input id="${channel_name}-station-name" placeholder="Station Name" type="text">
				</div>
				<div class="col s1" style="padding: 14px 6px;">
					<a onclick="channelAddStation('${channel_name}', event)" href="#"><i class="material-icons right ">add_circle</i></a>
				</div>
			</form>
			`

			for (const station of channel_info.stations) {

				console.log('station', station);

				let station_item = createNode('div', ['row', 'station-item', 'valign-wrapper']);
				station_item.innerHTML = `
					<div class="col s10">
						<span class="station-name">${station.name}</span><br>
						<span class="station-url grey-text">${station.url}</span>
					</div>
					<div class="col s2">
						<a onclick="deleteStation('${channel_info.name}', '${station.name}', event)" class="delete-station-btn" href="#"><i class="tiny material-icons right">close</i></a>
					</div>
				`

				channel_div.appendChild(station_item);
			}

			channel_list_div.appendChild(channel_div);
		}
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
		saveStations(channel_list);
		M.toast({ html: `${channel_name} channel saved with ${new_channel.stations.length} stations` });
	} else {
		if (channel_name) {
			M.toast({ html: `Add at least one station` });
		} else {
			M.toast({ html: `Give a name to the channel` });
			document.getElementById('modal-channel-name').focus();
		}
	}
});

// HELPER FUNCTIONS
function createNode(element, classNames) {
	let elem = document.createElement(element);
	if (classNames && classNames.length > 0) {
		for (const className of classNames) {
			elem.classList.add(className);
		}
	}
	return elem;
}
