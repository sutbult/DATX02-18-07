module Wallet.Types exposing (..)

import Bid.Types exposing (Value)

type alias Account = Value

type alias Model =
    { accounts : List Account
    }

type Msg
    = SetAccounts (List Account)
