module Settings.Types exposing (..)

type alias BlockchainPath =
    { currency: String
    , value: String
    }

type alias Settings =
    { blockchainPathList : List BlockchainPath
    }

type alias Model =
    { settings : Settings
    }

type Msg
    = SetBlockchainPath String String
