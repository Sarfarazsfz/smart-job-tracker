import * as repository from './resume.repository.js';

export async function processResumeUpload(userId, fileData) {
    const { filename, mimetype, buffer } = fileData;
    let text = '';

    if (mimetype === 'text/plain') {
        text = buffer.toString('utf-8');
    } else if (mimetype === 'application/pdf') {
        try {
            const pdfParse = (await import('pdf-parse')).default;
            const pdfData = await pdfParse(buffer);
            text = pdfData.text;
        } catch (pdfError) {
            console.error('PDF parsing error:', pdfError);
            const error = new Error('PDF parsing failed. Please try uploading a TXT file instead.');
            error.code = 'PARSE_ERROR';
            throw error;
        }
    }

    if (!text || text.trim().length < 50) {
        const error = new Error('Could not extract enough text from the file. Please ensure your resume has sufficient content.');
        error.code = 'INSUFFICIENT_TEXT';
        throw error;
    }

    const resumeData = {
        filename,
        mimetype,
        text,
        uploadedAt: new Date().toISOString()
    };

    await repository.saveResume(userId, resumeData);
    await repository.clearMatchScores(userId);

    return {
        filename,
        textLength: text.length
    };
}

export async function getResumeStatus(userId) {
    const resume = await repository.getResume(userId);

    if (!resume || !resume.text) {
        return { hasResume: false };
    }

    return {
        hasResume: true,
        filename: resume.filename,
        uploadedAt: resume.uploadedAt,
        textPreview: resume.text.substring(0, 200) + '...'
    };
}

export async function removeResume(userId) {
    await repository.deleteResume(userId);
    await repository.clearMatchScores(userId);
}

export async function saveResumeText(userId, text) {
    if (!text || text.trim().length < 50) {
        const error = new Error('Resume text must be at least 50 characters');
        error.code = 'INSUFFICIENT_TEXT';
        throw error;
    }

    const resumeData = {
        filename: 'resume.txt',
        mimetype: 'text/plain',
        text,
        uploadedAt: new Date().toISOString()
    };

    await repository.saveResume(userId, resumeData);
    await repository.clearMatchScores(userId);
}
