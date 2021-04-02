import { useCallback } from 'react';
const shared = require('@joplin/lib/components/shared/note-screen-shared');

export default function useOnMessage(onCheckboxChange: Function, noteBody: string, onMarkForDownload: Function, onJoplinLinkClick: Function, onResourceLongPress: Function) {
	return useCallback((event: any) => {
		// Since RN 58 (or 59) messages are now escaped twice???
		const msg = unescape(unescape(event.nativeEvent.data));
		// Maybe we can use this line instead?
		// const msg = decodeURI(event.nativeEvent.data);
		// This doc mentioned that unescape shouldn't be used in most cases, but I'm not sure about the context:
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/unescape
		console.info('Got IPC message: ', msg);

		if (msg.indexOf('checkboxclick:') === 0) {
			const newBody = shared.toggleCheckbox(msg, noteBody);
			if (onCheckboxChange) onCheckboxChange(newBody);
		} else if (msg.indexOf('markForDownload:') === 0) {
			const splittedMsg = msg.split(':');
			const resourceId = splittedMsg[1];
			if (onMarkForDownload) onMarkForDownload({ resourceId: resourceId });
		} else if (msg.startsWith('longclick:')) {
			onResourceLongPress(msg);
		} else if (msg.startsWith('joplin:')) {
			onJoplinLinkClick(msg);
		} else if (msg.startsWith('error:')) {
			console.error(`Webview injected script error: ${msg}`);
		} else {
			// msg is broken at this point if it contained special characters
			// see: https://github.com/laurent22/joplin/issues/4494
			const decodedURI = decodeURI(event.nativeEvent.data);
			onJoplinLinkClick(decodedURI);
		}
	}, [onCheckboxChange, noteBody, onMarkForDownload, onJoplinLinkClick, onResourceLongPress]);
}
