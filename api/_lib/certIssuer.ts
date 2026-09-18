import crypto from 'crypto';

export interface IssueCertPayload {
    studentId: string;
    courseId?: string;
    quizId?: string;
    score: number;
    maxScore: number;
    percentage: number;
    studentCode: string;
    track: string;
}

export function generateCertificateId(studentCode: string, track: string): string {
    const year = new Date().getFullYear();
    const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `TGZ-${track.toUpperCase()}-${year}-${studentCode.toUpperCase()}-${randomChars}`;
}

export function generateCertHash(certId: string, studentId: string, score: number): string {
    const data = `${certId}:${studentId}:${score}:${process.env.CERT_SECRET_KEY || 'default-secret'}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

export async function issueCertificateToDatabase(
    supabase: any,
    payload: IssueCertPayload
): Promise<{ certificate_id: string, cert_hash: string }> {
    const certId = generateCertificateId(payload.studentCode || 'STD', payload.track || 'GEN');
    const certHash = generateCertHash(certId, payload.studentId, payload.score);
    
    const { data, error } = await supabase.from('certificates').insert({
        certificate_id: certId,
        student_id: payload.studentId,
        course_id: payload.courseId,
        quiz_id: payload.quizId,
        final_score: payload.score,
        max_score: payload.maxScore,
        percentage: payload.percentage,
        cert_hash: certHash,
        status: 'valid'
    }).select().single();
    
    if (error) {
        throw new Error(`Failed to issue certificate: ${error.message}`);
    }
    
    return {
        certificate_id: data.certificate_id,
        cert_hash: data.cert_hash
    };
}
