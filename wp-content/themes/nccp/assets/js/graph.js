// Functions for building graph functionality
var colorSwatch = [
	'#016483',
	'#D92929',
	'#F2911B',
	'#F2CB05',
	'#6ECAC7'
];

// Same as build_line_graph, but combined
function build_combined_graph( data, parent ) {
	// Base the scale off the first set of data
	var first = data[ Object.keys( data )[ 0 ] ];

	// Figure out who has the min and max values
	var min = d3.min( first, function ( d ) { return d.value; } ),
		max = d3.max( first, function ( d ) { return d.value; } )

	$.each( data, function () {
		var thisMin = d3.min( this, function ( d ) { return d.value; } ),
			thisMax = d3.max( this, function ( d ) { return d.value; } )

		if ( thisMin < min ) min = thisMin;
		if ( thisMax > max ) max = thisMax;
	});

	// Graph width is calculated using window width because this is pretty much
	// the only thing that will ALWAYS return a consistent value
	var w = Math.floor( $(window).width() * 0.7 ),
		h = Math.floor( $(window).height() / 3 ),
		margin = 40,
		start = new Date( first[0].timestamp ),
		end = new Date( first[first.length - 1].timestamp ),
		y = d3.scale.linear().domain([ min, max ]).range([0 + margin, h - margin]),
		x = d3.scale.linear().domain([ start, end ]).range([0 + margin, w - margin]);

	var g = d3.select( parent ).append("svg:g").attr("transform", "translate(0, " + h + ")");

	// Calculate the actual data line and append to the graph
	var line = d3.svg.line()
		.x( function( d, i ) { return x( new Date( d.timestamp ) ); })
		.y( function( d ) { return -1 * y( d.value ); });

	$.each( data, function ( i ) {
		g.append( "svg:path" )
			.attr( "d", line( this ) )
			.attr( "class", "line" )
			.style( "stroke", colorSwatch[ i % colorSwatch.length ] );
	});	

	// Append axis boundaries
	build_graph_axes( x, y, w, h, margin, g );
}

function build_line_graph( data, parent, index ) {
	// Graph width is calculated using window width because this is pretty much
	// the only thing that will ALWAYS return a consistent value
	var w = Math.floor( $(window).width() * 0.7 ),
		h = Math.floor( $(window).height() / 3 ),
		margin = 40,
		start = new Date( data[0].timestamp ),
		end = new Date( data[data.length - 1].timestamp ),
		y = d3.scale.linear().domain([d3.min(data, function ( d ) { return d.value; }), d3.max(data, function ( d ) { return d.value; })]).range([ 0 + margin, h - margin ]),
		x = d3.scale.linear().domain([ start, end ]).range([0 + margin, w - margin]);

	var g = d3.select( parent ).append("svg:g").attr("transform", "translate(0, " + h + ")");

	// Calculate the actual data line and append to the graph
	var line = d3.svg.line()
		.x( function( d, i ) { return x( new Date( d.timestamp ) ); })
		.y( function( d ) { return -1 * y( d.value ); });

	g.append( "svg:path" )
		.attr( "d", line( data ) )
		.attr( "class", "line" )
		.style( "stroke", colorSwatch[ index % colorSwatch.length ] );

	// Append axis boundaries
	build_graph_axes( x, y, w, h, margin, g );

}

// Builds graph labels from passed x and y (d3 functions) and
// specified graph
function build_graph_axes( x, y, width, height, margin, graph ) {
	graph.append( "svg:line" )
		.attr( "class", "boundary" )
		.attr( "x1", margin )
		.attr( "y1", 0 )
		.attr( "x2", width - margin )
		.attr( "y2", 0 );

	graph.append( "svg:line" )
		.attr( "class", "boundary" )
		.attr( "x1", margin )
		.attr( "y1", -height )
		.attr( "x2", width - margin )
		.attr( "y2", -height );
	 
	graph.append( "svg:line" )
		.attr( "class", "boundary" )
		.attr( "x1", margin )
		.attr( "y1", 0 )
		.attr( "x2", margin )
		.attr( "y2", -height );

	graph.append("svg:line" )
		.attr( "class", "boundary" )
		.attr( "x1", width - margin )
		.attr( "y1", 0 )
		.attr( "x2", width - margin )
		.attr( "y2", -height );
	
	// Append tick labels
	graph.selectAll( ".xLabel" )
		.data( x.ticks( 5 ) )
		.enter().append( "svg:text" )
		.attr( "class", "xLabel" )
		.text( function ( v ) { 
			var date = new Date( v ); 
			return date.getFullYear() + '-' + ( date.getMonth() + 1 ) + '-' + date.getDate() + ' ' + 
				date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
		})
		.attr( "x", function( d ) { return x( d ) })
		.attr( "y", 30 )
		.attr( "text-anchor", "middle" )

	graph.selectAll( ".xLines" )
		.data( x.ticks( 5 ) )
		.enter().append( "svg:line" )
		.attr( "class", "xLines" )
		.attr( "x1", function ( d ) { return x( d ); } )
		.attr( "y1", 0 )
		.attr( "x2", function ( d ) { return x( d ); } )
		.attr( "y2", -height );

	graph.selectAll( ".yLabel" )
		.data( y.ticks( 5 ) )
		.enter().append( "svg:text" )
		.attr( "class", "yLabel" )
		.text( function ( v ) { return parseFloat( v ); } )
		.attr( "x", 0 )
		.attr( "y", function( d ) { return -1 * y( d ) } )
		.attr( "text-anchor", "left" )
		.attr( "dy", 4 );

	graph.selectAll( ".yLines" )
		.data( y.ticks( 5 ) )
		.enter().append( "svg:line" )
		.attr( "class", "yLines" )
		.attr( "x1", margin )
		.attr( "y1", function( d ) { return -1 * y( d ) } )
		.attr( "x2", width - margin )
		.attr( "y2", function( d ) { return -1 * y( d ) } );
}
