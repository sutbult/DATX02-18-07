module Settings.Types exposing (..)

import Error.Types

type alias BlockchainPath =
    { currency: String
    , value: String
    }

type alias Settings =
    { blockchainPathList : List BlockchainPath
    }

type alias Model =
    { currentSettings : Settings
    , savedSettings : Settings
    , loading : Bool
    , saving : Bool
    , error : Error.Types.Model
    }

type Msg
    = ToError Error.Types.Msg
    | SetBlockchainPath String String
    | SetSettings Settings
    | Reset
