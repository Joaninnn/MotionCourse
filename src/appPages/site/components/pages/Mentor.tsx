import React, { useState } from "react";
import Upload from "./mentorSection/Upload/Upload";
import UploadedVideos from "./mentorSection/UploadedVideos/UploadedVideos";

function Mentor() {
    const [editingId, setEditingId] = useState<number | null>(null);

    return (
        <div>
            <Upload editingId={editingId || undefined} onCancel={() => setEditingId(null)} />
            <UploadedVideos editingId={editingId} setEditingId={setEditingId} />
        </div>
    );
}

export default Mentor;
