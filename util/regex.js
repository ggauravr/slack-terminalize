'use strict';

var regex = {
	// Slack isn't consistent with wrapping strings in matching quotes, so ignore matching open and close quotes
	// and look generally for strings inside quotes, irrespective of the type
	between_quotes	: /['‘’"“”]([^'‘’"“”]*)['‘’"“”]/g,
	multi_spaces	: /\s+/g
};

exports.regex = regex;
