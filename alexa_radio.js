let info =
{
	resume: {
		collection: 'Game Of Thrones',
		item: 'Catelyn',
		index: 1,
		offset: 12345
	},
	list: [
		{
			"name": "Party Radio",
			"type": "playlist",
			"items": [
				{
					"url": "https://yp.shoutcast.com/sbin/tunein-station.m3u?id=1376488",
					"name": "Hitparty by PulsRadio"
				},
				{
					"url": "https://yp.shoutcast.com/sbin/tunein-station.m3u?id=1757116",
					"name": "Club Mix Radio"
				}
			]
		},
		{
			"name": "Meditation Radio",
			"type": "playlist",
			"items": [
				{
					"url": "https://yp.shoutcast.com/sbin/tunein-station.m3u?id=1656843",
					"name": "1.FM - Destination:SPA"
				},
				{
					"url": "https://yp.shoutcast.com/sbin/tunein-station.m3u?id=1390835",
					"name": "Ambient Sleeping Pill"
				},
				{
					"url": "https://yp.shoutcast.com/sbin/tunein-station.m3u?id=99428464",
					"name": "Hippie Soul Cafe"
				}
			]
		},
		{
			"name": "Grand Theft Auto",
			"type": "playlist",
			"items": [
				{
					"url": "https://s3.amazonaws.com/gtaradio/Bounce FM.mp3",
					"name": "Bounce FM"
				},
				{
					"url": "https://s3.amazonaws.com/gtaradio/VROCK.mp3",
					"name": "V Rock"
				},
				{
					"url": "https://s3.amazonaws.com/gtaradio/FEVER.mp3",
					"name": "Fever"
				}
			]
		},
		{
			"name": "Game Of Thrones",
			"type": "book",
			"progress": {
				"index": 1,
				"offset": 12345,
				"status": "in progress"
			},
			"items": [
				{
					"url": "https://numerous-mosquito-9311.dataplicity.io/chapter_1_1.mp3",
					"name": "Bran",
					"offset": 0,
					"completed": 1,
					"status": "available"
				},
				{
					"url": "https://numerous-mosquito-9311.dataplicity.io/chapter_1_2.mp3",
					"name": "Catelyn",
					"offset": 12345,
					"completed": 0,
					"status": "available"
				}
			]
		}
	],
	settings: {
		now_playing_text: [
			"Now playing",
			"This is"
		],
		resuming_text: [
			"Now resuming",
			"Resuming"
		],
		exit_text: [
			"Goodbye",
			"Talk to you soon"
		]
	}
}

const empty_state_html = `
	<div class="empty-state">
		<div class="flow-text">You have not saved anything.
		<br>
		Add a channel or a book, by clicking the buttons above.</div>
	</div>
`

// Entire collection data
let collection_resume;
// Items list from collection 
let collection_list;
// Settings from collection 
let collection_settings;

let new_collection = {
	name: '',
	items: []
};

getItems();
// ^(https).+\.(m3u|mp3)+(\?([^?]*))? - find valid URLs

// Add Collection Item Button Listener
// Update Modal Fields - Channel / Book
document.querySelectorAll('.collection-item-add-btn').forEach(collection_add_btn => {
	collection_add_btn.addEventListener('click', e => {
		let collection_type = e.target.getAttribute('data-type');
		// Update Modal Title
		getElement('#modal-collection-title').innerHTML = (collection_type === 'book') ? 'Add Book Collection' : 'Add Channel';
		// Update Icon
		getElement('#modal-collection-icon').innerHTML = (collection_type === 'book') ? 'collections_bookmark' : 'library_music';
		// Update Collection Name Placeholder
		getElement('#modal-collection-name-input').placeholder = (collection_type === 'book') ? 'Collection name' : 'Channel name';
		// Update Collection Name Helper Text
		getElement('#modal-collection-name-helper').innerHTML = (collection_type === 'book') ? 'e.g: Game of Thrones' : 'e.g: Chill Out or Smooth Jazz';
		// Add Advanced Item Add Option
		getElement('.modal-collection-add-advanced').style = (collection_type === 'book') ? 'display:block' : 'display:none';
		// Update Collection Add Item Name Placeholder
		getElement('#modal-item-name').placeholder = (collection_type === 'book') ? 'Book name' : 'Channel name';
		// Update Collection Add Item URL Placeholder
		getElement('#modal-item-url').placeholder = (collection_type === 'book') ? 'https://example.com/folder/book_1.mp3' : 'https://shoutcast.com/tunein-station.m3u?id=1796807'
		// Update Collection Save Button with Collection Type
		getElement('#modal-collection-save').innerHTML = (collection_type === 'book') ? 'Save Collection' : 'Save Channel';
	})
})


// EVENT LISTENERS
// <!-- Modal Add Item -->
getElement('#modal-add-item-btn').addEventListener('click', e => {
	let station_items_div = getElement('#modal-items-list');

	let item_name = getElement('#modal-item-name');
	let item_url = getElement('#modal-item-url');

	let name_valid = item_name.classList.contains("valid");
	let url_valid = item_url.classList.contains("valid");

	if (name_valid && url_valid) {
		// Add to collection
		let new_item = {
			name: item_name.value,
			url: item_url.value,
			offset: 0,
			completed: 0,
			status: 'unplayed'
		}

		new_collection.items.push(new_item);
		renderModalItem(new_collection.items);

		M.toast({ html: `${item_name.value} added` });

		// Clear form
		getElement('#modal-item-name').value = '';
		getElement('#modal-item-name').classList.remove('valid');
		getElement('#modal-item-url').value = '';
		getElement('#modal-item-url').classList.remove('valid');

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

// <!-- Modal Save Collection -->
getElement('#modal-collection-save').addEventListener('click', e => {
	let collection_name = document.getElementById('modal-collection-name').value;

	if (collection_name && new_collection.items.length > 0) {
		// console.log('clicked');
		new_collection.name = collection_name;
		new_collection.type = 'book';
		modal_collection_save_btn.classList.add('modal-close');

		// Add new channel to channel list
		console.log(collection_list, new_collection);
		collection_list.push(new_collection);
		// Render channels
		renderChannels(collection_list);
		saveStations(collection_list);

		M.toast({ html: `${channel_name} channel saved with ${new_collection.items.length} stations` });
	} else {
		if (collection_name) {
			M.toast({ html: `Add at least one book` });
		} else {
			M.toast({ html: `Give a name to the collection` });
			document.getElementById('modal-collection-name').focus();
		}
	}
});


// Get Data
async function getItems() {
	axios({
		url: 'https://tinkr.api.stdlib.com/radio@dev/stations/',
		method: "GET"
	})
		.then(result => {
			console.log('result', result.data);
			// Empty state check
			collection = result.data;

			// Save info to local variables
			collection_resume = collection.resume || {};
			collection_list = collection.list || [];
			collection_settings = collection.settings || {};

			renderCollections(collection_list);
			// Listen to Channel Name Edit
			let channel_names = document.querySelectorAll('.channel-name');
			// console.log(channel_names);

			channelRenameListener(channel_names);

		})
}


// Show Item Add Input Fields
function showAddItem(collection_item_name, event) {
	event.preventDefault();

	let item_add = document.querySelector(`.${collection_item_name}-item-add`);
	let item_add_icon = document.querySelector(`#${collection_item_name}-show-add`);

	if (item_add.style.display === 'block') {
		item_add.style = 'display:none'
		item_add_icon.innerHTML = 'add'
	} else {
		item_add.style = 'display:block'
		item_add_icon.innerHTML = 'close'
	}
}

function showBookAddAdvanced() {
	event.preventDefault();
	if (document.querySelector('#book-add-advanced').style.display === 'block') {
		document.querySelector('#book-add-advanced').style = 'display:none'
	} else {
		document.querySelector('#book-add-advanced').style = 'display:block'
	}
}

function collectionAddItem(collection_item_name, event) {

	event.preventDefault();
	let collection_item_div = document.getElementById(collection_item_name);

	let item_name = document.getElementById(`${collection_item_name}-item-name`).value;
	let item_url = document.getElementById(`${collection_item_name}-item-url`).value;

	if (item_name && item_url) {
		renderStationItem(item_name, item_url, collection_item_div);
		// Toast
		M.toast({ html: `${station_namitem_name} added` });

		for (const [channel_index, channel] of collection_list.entries()) {
			if (channel.name === collection_item_name.replace(/-/g, ' ')) {

				// Clear input fields
				document.getElementById(`${collection_item_name}-item-name`).value = '';
				document.getElementById(`${collection_item_name}-item-url`).value = '';

				let new_item = {
					name: item_name,
					url: item_url,
					offset: 0,
					completed: 0,
					status: 'unplayed'
				}

				collection_list[channel_index].stations.push(new_item);
				console.log('collection_list', collection_list);
				saveStations(collection_list);
			} else {
				console.log(channel_index, channel.name, collection_item_name);
			}
		}


	} else {
		M.toast({ html: `Add station name and station URL` });

	}
}

function deleteItem(collection_name, item_name, event) {
	event.preventDefault();
	for (const [collection_index, collection] of collection_list.entries()) {
		if (collection.name === collection_name) {
			for (const [index, item] of collection.items.entries()) {
				// for (const station of channel.stations) {
				if (item.name === item_name) {
					console.log(index, item);
					collection_list[collection_index].items.splice(index, 1);

					// Delete Collection if it has no items
					if (collection_list[collection_index].items.length > 0) {

					} else {
						collection_list.splice(collection_index, 1);
					}

					renderCollections(collection_list);
					saveStations(collection_list);
				}
			}
		}
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
			collection_list[index].name = e.target.textContent;
			saveStations(collection_list);
			console.log(collection_list);
		});
	});
}

function saveStations(channels) {
	let data = {
		settings: collection.settings || {},
		resume: collection.resume || {},
		list: channels
	}
	updateDB(data);
}

// Listen for Show Settings Button Click
let show_settings_btn = document.getElementById('show-settings-btn');
show_settings_btn.addEventListener('click', e => {
	// Fill Input Fields - Now Playing
	if (collection_settings.now_playing) {
		document.querySelector('.now-playing').querySelectorAll('input').forEach((now_playing_txt, index) => {
			now_playing_txt.value = collection_settings.now_playing[index] || '';
		});
	}
	// Fill Input Fields - Stop Playing
	if (collection_settings.stop_playing) {
		document.querySelector('.stop-playing').querySelectorAll('input').forEach((stop_playing_txt, index) => {
			stop_playing_txt.value = collection_settings.stop_playing[index] || '';
		});
	}
	// Fill Input Fields - Error
	if (collection_settings.error) {
		document.querySelector('.error').querySelectorAll('input').forEach((error_txt, index) => {
			error_txt.value = collection_settings.error[index] || '';
		});
	}
})

// Listen for Save Settings Button Click
let save_settings_btn = document.getElementById('settings-save');
save_settings_btn.addEventListener('click', e => {
	let now_playing_txt_div = document.querySelector('.now-playing');
	let stop_playing_txt_div = document.querySelector('.stop-playing');
	let error_txt_div = document.querySelector('.error');

	collection_settings.now_playing = [];
	collection_settings.stop_playing = [];
	collection_settings.error = [];

	now_playing_txt_div.querySelectorAll('input').forEach(txt => {
		if (txt.value) {
			collection_settings.now_playing.push(txt.value);
		}
	});
	stop_playing_txt_div.querySelectorAll('input').forEach(txt => {
		if (txt.value) {
			collection_settings.stop_playing.push(txt.value);
		}
	});
	error_txt_div.querySelectorAll('input').forEach(txt => {
		if (txt.value) {
			collection_settings.error.push(txt.value);
		}
	});

	let data = {
		settings: collection_settings,
		list: collection_list,
		resume: collection_resume
	}

	console.log('saving settings...');

	updateDB(data);
})

// Global database updater
async function updateDB(data) {
	axios({
		url: `https://tinkr.api.stdlib.com/radio@dev/stations?status=update&info=${JSON.stringify(data)}`,
		method: "GET"
	})
		.then(result => {
			console.log('result', result);
		})
		.catch(error => {
			console.log('error', error);
		})
}

// Render Channels and Books
function renderCollections(collection_list) {
	let collection_list_div = document.getElementById('collection-list');
	collection_list_div.innerHTML = '';

	let collections = Object.keys(collection_list);
	// console.log(channels);

	if (collections.length > 0) {
		for (const [index, _collection] of collections) {
			let collection = collection_list[index];
			// console.log(collection);
			let collection_name = collection.name.replace(/ /g, '-');

			// div for each collection
			let collection_div = createNode('div', ['container', 'collection', 'card']);
			collection_div.id = collection_name;

			collection_div.innerHTML = collectionItemHTML(index, collection, collection_name);

			let items_div = itemsDivHTML(collection);

			collection_div.appendChild(items_div);
			collection_list_div.appendChild(collection_div);

		}
	} else {
		collection_list_div.innerHTML = empty_state_html;
	}
}

function collectionItemHTML(index, collection, collection_name) {
	let collection_icon = (collection.type === 'book') ?  'collections_bookmark' : 'queue_music';

	let html = `
		<div class="collection-header">
			<form class="row">
				<div class="col s1 left">
					<i class="material-icons">${collection_icon}</i>
				</div>
				<div class="col s10">
					<div data-index="${index}" class="collection-name left-align" contenteditable="true">${collection.name}</div>
				</div>
				<div class="col s1">
					<a onclick="showAddItem('${collection_name}', event)" class="add-item-btn" href="#"><i
							id="${collection_name}-show-add" class="material-icons right">add</i></a>
				</div>
			</form>
		</div>
		<div class="row collection-item-add ${collection_name}-item-add" style="display:none">
			<form>
				<div class="col s12">
					<input id="${collection_name}-item-url" placeholder="Station URL" type="url" class="validate">
				</div>
				<div class="col s10">
					<input id="${collection_name}-item-name" placeholder="Station Name" type="text" class="validate">
				</div>
				<div class="col s2 right-align" style="padding: 14px 6px;">
					<a onclick="collectionAddItem('${collection_name}', event)" class="btn-floating btn-small pulse"><i
							class="material-icons">add</i></a>
				</div>
			</form>
		</div>
		`;

	return html;
}

function itemsDivHTML(collection) {
	let items_div = createNode('div', ['items-container']);
	for (const item of collection.items) {
		// console.log('station', station);
		let item_div = createNode('div', ['row', 'item', 'valign-wrapper']);
		item_div.innerHTML = `
					<div class="col s11">
						<span class="item-name">${item.name}</span>
						<span class="item-status-${item.status}">${item.status}</span><br>
						<span class="item-url">${item.url}</span>
					</div>
				
					<div class="col s1">
						<a onclick="deleteItem('${collection.name}', '${item.name}', event)" class="delete-item-btn" href="#"><i class="tiny material-icons right">close</i></a>
					</div>
				`;
		items_div.appendChild(item_div);
	}
	return items_div;
}

// <!-- Modal Delete Station -->
function deleteModalItem(index) {
	// console.log(new_channel.stations, station_index);
	M.toast({ html: `${new_collection.items[index].name} deleted` });
	new_collection.items.splice(index, 1);
	renderModalItem(new_collection.items);
}

// Render Modal Item
function renderModalItem(items) {
	let items_list_div = document.getElementById('modal-items-list');

	if (items.length > 0) {
		items_list_div.innerHTML = '';

		items.forEach((item, index) => {
			items_list_div.innerHTML += `
					<div id="modal-station-${index}" class="row station-item valign-wrapper">
						<div class="col s8">
							<span class="station-name">${item.name}</span><br>
							<span class="station-url grey-text">${item.url}</span>
						</div>
						<div class="col s4">
							<a onclick="deleteModalItem('${index}')" data-index="${index}" href="#"><i class="material-icons right">close</i></a>
						</div>
					</div>				
					`
		});
	} else {
		items_list_div.innerHTML = '';
	}
}

// Render Modal Book Item
function renderModalBookItem(books) {
	let book_list_div = document.getElementById('modal-book-list');

	if (books.length > 0) {
		book_list_div.innerHTML = '';

		books.forEach((book, index) => {
			book_list_div.innerHTML += `
					<div id="modal-book-${index}" class="row station-item valign-wrapper">
						<div class="col s8">
							<span class="book-name">${book.name}</span><br>
							<span class="book-url grey-text">${book.url}</span>
						</div>
						<div class="col s4">
							<a onclick="modalBookDelete('${index}')" data-index="${index}" href="#"><i class="material-icons right">close</i></a>
						</div>
					</div>				
					`
		});
	} else {
		book_list_div.innerHTML = '';
	}
}



// <!-- Modal Save Collection -->
let modal_collection_save_btn = document.getElementById('modal-collection-save');

modal_collection_save_btn.addEventListener('click', e => {
	let collection_name = document.getElementById('modal-collection-name').value;

	if (collection_name && new_collection.items.length > 0) {
		// console.log('clicked');
		new_collection.name = collection_name;
		new_collection.type = 'book';
		modal_collection_save_btn.classList.add('modal-close');

		// Add new channel to channel list
		console.log(collection_list, new_collection);
		collection_list.push(new_collection);
		// Render channels
		renderChannels(collection_list);
		saveStations(collection_list);

		M.toast({ html: `${channel_name} channel saved with ${new_collection.items.length} stations` });
	} else {
		if (collection_name) {
			M.toast({ html: `Add at least one book` });
		} else {
			M.toast({ html: `Give a name to the collection` });
			document.getElementById('modal-collection-name').focus();
		}
	}
});

// Listener for Book URL Pattern
let pattern_path = document.getElementById('url-pattern-path');
let pattern_number = document.getElementById('url-pattern-number');
let pattern_extension = document.getElementById('url-pattern-extension');

let pattern_url = document.getElementById('url-pattern-url');

let item_count = document.getElementById('auto-item-count');
let book_item_count = document.getElementById('book-item-count');

pattern_path.addEventListener('keyup', e => {
	console.log(pattern_path.value);
	pattern_url.innerHTML = pattern_path.value + pattern_number.value + pattern_extension.value;
})
pattern_number.addEventListener('keyup', e => {
	console.log(pattern_number.value);
	pattern_url.innerHTML = pattern_path.value + pattern_number.value + pattern_extension.value;
	// item_count.innerHTML = pattern_number.value;
	// console.log('book_item_count', book_item_count);

	book_item_count.innerHTML = ` ${pattern_number.value}`;
})
pattern_extension.addEventListener('keyup', e => {
	console.log(pattern_extension.value);
	pattern_url.innerHTML = pattern_path.value + pattern_number.value + pattern_extension.value;
})


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

function getElement(id_class) {
	return document.querySelector(id_class);
}

// Get Random Activity
const activity = () => {
	let activities = ["Read a book", "Rearrange the furniture", "Start an observation notebook", "Learn a foreign language", "Deep-clean your room", "Take a nap", "Dig up your family tree", "Do some puzzles", "Teach yourself a card trick", "Start a workout routine", "Blow bubbles", "Write a journal", "Plan a vacation", "Read the newspaper", "Play with a cat", "on a wandering walk", "Explore Wikipedia", "Take a long bath", "Binge-watch a great TV series", "Discover new music", "Revisit a favorite movie", "Do some stargazing", "on a hike", "Write poetry", "Ride a bike", "listen to a podcast", "learn to juggle", "bake some bread", "Take some pictures", "Start a blog", "visit an art gallery", "practice origami", "Make a time capsule", "Do some networking", "Build some paper airplanes", "Walk around the city", "Draw something", "Do some excercise"];

	const randomItem = (arrayOfItems) => {
		let i = 0;
		i = Math.floor(Math.random() * arrayOfItems.length);
		return (arrayOfItems[i]);
	};

	return `I'll go ${randomItem(activities).toLowerCase()}.`;
}
