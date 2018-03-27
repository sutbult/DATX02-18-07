module Wallet.View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)

import Wallet.Types exposing (..)

import Bid.Types exposing
    ( baseUnit
    )

root : Model -> Html Msg
root model =
    table [class "table is-fullwidth is-hoverable is-striped"]
        [ head
        , tbody []
            <| List.map accountView model.accounts
        ]

head : Html Msg
head =
    thead []
        [ tr []
            [ th [] [text "Currency"]
            , th [] [text "In wallet"]
            ]
        ]

accountView : Account -> Html Msg
accountView account =
    tr []
        [ td []
            [ text account.currency
            ]
        , td []
            [ text <| amountString account
            ]
        ]


amountString : Account -> String
amountString account =
    let
        (basePow, _) = baseUnit account.currency
        amount = account.amount
        base = String.dropRight basePow amount
        dec = removeInitialZeroes <| String.right basePow amount
        separator =
            if String.isEmpty dec then
                ""
            else
                "."
    in
        base ++ separator ++ dec


-- TODO: Implementera med reguljära uttryck istället
-- Se också Add.Types
removeInitialZeroes : String -> String
removeInitialZeroes str =
    if String.endsWith "0" str then
        removeInitialZeroes (String.dropRight 1 str)
    else
        str
