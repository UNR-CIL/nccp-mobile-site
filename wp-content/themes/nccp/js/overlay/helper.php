<?php
/*
 * @author Tim Shaw
 * @description Simple helper file for form processing and file I/O
 * @usage Provides the kind of love only a server can give
 *
 */

// Figure out where we are for file operations
$basepath = str_ireplace( 'helper.php', '', $_SERVER['SCRIPT_FILENAME'] );

// Upload a new image for the specified path
if ( isset( $_FILES['overlay-new-image-file'] ) )
	echo call_user_func( function () use ( $basepath ) {

		$target = getcwd() . DIRECTORY_SEPARATOR . 'overlays' . DIRECTORY_SEPARATOR . basename( $_FILES['overlay-new-image-file']['name'] );

		if ( @move_uploaded_file( $_FILES['overlay-new-image-file']['tmp_name'], $target ) ) {

			// Get the current overlays
			$entries = json_decode( file_get_contents( $basepath . 'overlays.json' ) );

			// See if an entry already exists for this path and replace it if so
			if ( ! empty( $entries ) )
				foreach ( $entries as &$entry )
					if ( $entry->path == $_POST['overlay-page-path'] ) {
						$found = true;
						$entry->file = basename( $_FILES['overlay-new-image-file']['name'] );
					}

			// Otherwise add a new entry
			if ( ! isset( $found ) )
				$entries[] = array( 'path' => $_POST['overlay-page-path'], 'file' => basename( $_FILES['overlay-new-image-file']['name'] ) );

			file_put_contents( $basepath . 'overlays.json', json_encode( $entries ));

		    return json_encode( array( 'success' => 'Successfully uploaded file!', 'filename' => basename( $_FILES['overlay-new-image-file']['name'] ) ) );

		} else

			return json_encode( array( 'error' => 'Could not upload file.' ) );

	});
	
// Retrieve image for the sent path (if it exists)
if ( isset( $_POST['retrieve'] ) && isset( $_POST['path'] ) )
	echo call_user_func( function () use ( $basepath ) {

		$entries = json_decode( file_get_contents( $basepath . 'overlays.json' ) );

		if ( ! empty( $entries ) )
			foreach ( $entries as $entry )
				if ( $entry->path == $_POST['path'] ) {
					return json_encode( $entry );
				}
		
	});

// Modify an existing entry with size information
if ( isset( $_POST['edit'] ) && isset( $_POST['path'] ) )
	echo call_user_func( function () use ( $basepath ) {

		$entries = json_decode( file_get_contents( $basepath . 'overlays.json' ) );

		if ( ! empty( $entries ) )
			foreach ( $entries as &$entry )
				if ( $entry->path == $_POST['path'] ) {
					$entry->sizing = array(
						'top' => $_POST['top'],
						'left' => $_POST['left'],
						 'width' => $_POST['width']
					);
					
					file_put_contents( $basepath . 'overlays.json', json_encode( $entries ));

					return json_encode( array( 'success' => 'Path successfully modified' ) ); 
				}
		
		return json_encode( array( 'error' => 'Could not find specified path.' ) );
	});

?>
