module Wallet.Types exposing (..)

import Bid.Types exposing (Value)
import Error.Types

type alias Account = Value

type alias Model =
    { accounts : List Account
    , error : Error.Types.Model
    }

type Msg
    = SetAccounts (List Account)
    | ToError Error.Types.Msg
