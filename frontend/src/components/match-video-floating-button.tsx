"use client";

import { useState } from "react";
import { FloatingActionButton } from "@/components/floating-action-button";
import { VideoModal } from "@/components/video-modal";
import { Video } from "lucide-react";

interface MatchVideoFloatingButtonProps {
    matchId: number;
}

export function MatchVideoFloatingButton({ matchId }: MatchVideoFloatingButtonProps) {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    return (
        <>
            <VideoModal
                matchId={matchId}
                open={isVideoModalOpen}
                onOpenChange={setIsVideoModalOpen}
                trigger={null}
            />
            <FloatingActionButton
                onClick={() => setIsVideoModalOpen(true)}
                title="赛事视频"
                icon={<Video className="w-7 h-7 text-primary" />}
                bottom={104}
            />
        </>
    );
}
