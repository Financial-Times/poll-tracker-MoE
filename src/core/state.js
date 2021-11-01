/**
 * @file
 * The current state of template. You can make some or all of the properties
 * of the state object available to the user as settings in settings.js.
 */

export default {
	layout: {
		title: 'Title not yet added',
		subtitle: 'Suntitle not yet added',
		footer_note: "Source: Not yet added",
		background_color: '#fff1e5',
	},
	x: {title_mode: 'custom', tick_label_angle: 0},
	y: {title_mode: 'custom'},
	y2: {},
	color: {domain: ['US', 'UK'], range: ['#f3d4c2','e3c1a5'],},
	chart_bg: {},
    fixedHeight: false,
	height: 550,
	dateFormat: '%d/%m/%Y',
	tickFormat: null,
	dotSize: 2.5,
	dotOpacity: 0.2,
	polls:{smallSize: 2.0, largeSize: 2.5, smallOpacity: 0.2, largeOpacity: 0.3}
};
