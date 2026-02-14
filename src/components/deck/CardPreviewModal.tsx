'use client'

import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import Modal from '@mui/material/Modal'

type CardPreviewModalProps = {
  imageUrl: string | undefined
  onClose: () => void
}

const CardPreviewModal = ({ imageUrl, onClose }: CardPreviewModalProps) => (
  <Modal open={imageUrl !== undefined} onClose={onClose}>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Fab onClick={onClose} size="small" color="warning" sx={{ position: 'absolute', top: 4, right: 4 }}>
        <CloseIcon />
      </Fab>
      {imageUrl && (
        <Box component="img" src={imageUrl} alt="Card preview" sx={{ maxHeight: '80vh', maxWidth: '80vw' }} />
      )}
    </Box>
  </Modal>
)

export default CardPreviewModal
